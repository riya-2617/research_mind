import os
import math
import hashlib
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from app.config import settings

class RobustAcademicEmbeddingFunction(EmbeddingFunction[Documents]):
    """
    Self-contained, ultra-fast 384-dimensional dense embedding projector.
    Runs 100% offline with zero network download requirement,
    ensuring ChromaDB works instantaneously in sandboxed, air-gapped, or cloud environments.
    """
    def __init__(self, dim: int = 384):
        self.dim = dim

    def name(self) -> str:
        return "RobustAcademicEmbeddingFunction"

    def _embed_single(self, text: str) -> List[float]:
        vec = [0.0] * self.dim
        clean_text = text.lower()
        words = [w.strip(".,;:?!'\"()[]{}") for w in clean_text.split() if w]
        if not words:
            return vec

        # Project n-grams and words into dimensional buckets with sign hashing
        for idx, word in enumerate(words):
            pos_weight = 1.0 + (1.0 / (1.0 + idx * 0.05))
            
            # Word level hash
            h_val = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            bucket = h_val % self.dim
            sign = 1.0 if (h_val % 2 == 0) else -1.0
            vec[bucket] += sign * 1.5 * pos_weight

            # Character tri-gram subwords for morphological semantic similarity
            for i in range(len(word) - 2):
                ngram = word[i:i+3]
                h_ng = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest(), 16)
                b_ng = h_ng % self.dim
                s_ng = 1.0 if (h_ng % 2 == 0) else -1.0
                vec[b_ng] += s_ng * 0.5

        # L2 normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 1e-8:
            vec = [x / norm for x in vec]
        return vec

    def __call__(self, input: Documents) -> Embeddings:
        return [self._embed_single(doc) for doc in input]


class VectorStoreManager:
    """
    ChromaDB wrapper providing persistent storage and semantic vector retrieval
    with strict metadata tracking (paper_id, page, section, title).
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStoreManager, cls).__new__(cls)
            cls._instance._init_client()
        return cls._instance

    def _init_client(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        os.makedirs(self.persist_dir, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False)
        )

        self.embedding_fn = RobustAcademicEmbeddingFunction()

        self.collection = self.client.get_or_create_collection(
            name="research_papers",
            embedding_function=self.embedding_fn,
            metadata={"description": "RESEARCHMIND Paper Knowledge Base"}
        )

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        if not chunks:
            return 0

        ids = [c["chunk_id"] for c in chunks]
        documents = [c["content"] for c in chunks]
        metadatas = [
            {
                "paper_id": str(c["paper_id"]),
                "paper_title": str(c.get("paper_title", "Untitled")),
                "filename": str(c.get("filename", "")),
                "page": int(c.get("page", 1)),
                "section": str(c.get("section", "General")),
            }
            for c in chunks
        ]

        batch_size = 100
        for i in range(0, len(ids), batch_size):
            end = i + batch_size
            self.collection.upsert(
                ids=ids[i:end],
                documents=documents[i:end],
                metadatas=metadatas[i:end]
            )
        return len(chunks)

    def search(
        self,
        query: str,
        top_k: int = 5,
        paper_id: Optional[str] = None,
        page_range: Optional[tuple] = None
    ) -> List[Dict[str, Any]]:
        where_clause = None
        if paper_id:
            where_clause = {"paper_id": paper_id}

        results = self.collection.query(
            query_texts=[query],
            n_results=top_k,
            where=where_clause,
            include=["documents", "metadatas", "distances"]
        )

        retrieved: List[Dict[str, Any]] = []
        if not results or not results["documents"] or len(results["documents"][0]) == 0:
            return retrieved

        docs = results["documents"][0]
        metas = results["metadatas"][0]
        ids = results["ids"][0]
        distances = results.get("distances", [[0.0] * len(docs)])[0]

        for doc_text, meta, chunk_id, dist in zip(docs, metas, ids, distances):
            page = meta.get("page", 1)
            if page_range and (page < page_range[0] or page > page_range[1]):
                continue

            similarity_score = max(0.0, 1.0 - (dist / 2.0 if dist is not None else 0.5))
            retrieved.append({
                "chunk_id": chunk_id,
                "content": doc_text,
                "paper_id": meta.get("paper_id"),
                "paper_title": meta.get("paper_title"),
                "filename": meta.get("filename"),
                "page": page,
                "section": meta.get("section"),
                "similarity_score": round(similarity_score, 4),
                "citation": f"[{meta.get('paper_title')}, Page {page}]"
            })

        return retrieved

    def delete_paper(self, paper_id: str):
        try:
            self.collection.delete(where={"paper_id": paper_id})
        except Exception as e:
            print(f"Error deleting paper {paper_id} from vector store: {e}")

    def get_all_indexed_papers(self) -> List[str]:
        try:
            all_meta = self.collection.get(include=["metadatas"])
            if not all_meta or not all_meta["metadatas"]:
                return []
            paper_ids = list(set(m.get("paper_id") for m in all_meta["metadatas"] if m.get("paper_id")))
            return paper_ids
        except Exception:
            return []

vector_store = VectorStoreManager()
