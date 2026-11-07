from typing import Optional, List
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.vector_store import vector_store
from app.services.llm_manager import llm_manager

router = APIRouter(prefix="/rag", tags=["rag"])

class QuestionRequest(BaseModel):
    query: str
    paper_id: Optional[str] = None
    top_k: int = 5

class RetrieveRequest(BaseModel):
    query: str
    paper_id: Optional[str] = None
    top_k: int = 5

@router.post("/ask")
async def ask_rag(req: QuestionRequest):
    chunks = vector_store.search(query=req.query, top_k=req.top_k, paper_id=req.paper_id)
    if not chunks:
        return {
            "answer": "No relevant evidence found in the indexed papers. Please check that documents are uploaded or broaden your search query.",
            "citations": [],
            "chunks": []
        }

    context_lines = [f"{c['citation']}: {c['content']}" for c in chunks]
    context_str = "\n\n".join(context_lines)

    prompt = (
        f"You are RESEARCHMIND, an academic research assistant.\n\n"
        f"Context from uploaded papers:\n"
        f"{context_str}\n\n"
        f"Question: {req.query}\n\n"
        f"Provide an academically rigorous answer grounded strictly in the context above. "
        f"Include page-level citations in the format [Paper Title, Page X] for every claim."
    )

    answer = llm_manager.generate(
        prompt=prompt,
        system_prompt="You are an expert research scientist. Maintain high academic standards and strict citation attribution."
    )

    citations = list(dict.fromkeys([c["citation"] for c in chunks]))

    return {
        "query": req.query,
        "answer": answer,
        "citations": citations,
        "chunks": chunks
    }

@router.post("/retrieve")
async def retrieve_chunks(req: RetrieveRequest):
    chunks = vector_store.search(query=req.query, top_k=req.top_k, paper_id=req.paper_id)
    return {
        "query": req.query,
        "count": len(chunks),
        "chunks": chunks
    }

