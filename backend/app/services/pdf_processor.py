import re
import pymupdf as fitz
from pathlib import Path
from typing import List, Dict, Any, Optional
import uuid

class PDFProcessor:
    """
    Extracts text, metadata, and structured section-aware chunks
    with page-level tracking from academic research PDFs.
    """

    @staticmethod
    def extract_metadata(doc: fitz.Document, filename: str) -> Dict[str, Any]:
        meta = doc.metadata or {}
        first_page_text = doc[0].get_text("text") if len(doc) > 0 else ""
        
        # Detect title: prefer doc.metadata["title"] if reasonable, else first significant lines
        title = meta.get("title", "").strip()
        if not title or len(title) < 5 or "untitled" in title.lower() or title.endswith(".pdf"):
            lines = [line.strip() for line in first_page_text.split("\n") if line.strip()]
            candidate_lines = []
            for line in lines[:8]:
                if any(kw in line.lower() for kw in ["arxiv:", "doi:", "http", "vol.", "issue"]):
                    continue
                if len(line) > 3:
                    candidate_lines.append(line)
                if len(" ".join(candidate_lines)) > 30:
                    break
            title = " ".join(candidate_lines) if candidate_lines else Path(filename).stem
            
        # Clean title
        title = re.sub(r'\s+', ' ', title).strip()
        if not title:
            title = Path(filename).stem

        # Detect abstract
        abstract = ""
        abstract_match = re.search(r'abstract[:\s\n]+(.*?)(?=(?:1\.?\s+|I\.?\s+)?introduction|index terms|keywords)', first_page_text, re.DOTALL | re.IGNORECASE)
        if abstract_match:
            abstract = re.sub(r'\s+', ' ', abstract_match.group(1)).strip()[:1500]
        elif "abstract" in first_page_text.lower():
            idx = first_page_text.lower().find("abstract")
            abstract = re.sub(r'\s+', ' ', first_page_text[idx+8:idx+1000]).strip()
        else:
            abstract = re.sub(r'\s+', ' ', first_page_text[:600]).strip()

        # Authors detection
        author = meta.get("author", "").strip()
        if not author:
            # Try to grab lines between title and abstract
            lines = [l.strip() for l in first_page_text.split("\n") if l.strip()]
            author_candidates = []
            for l in lines[1:6]:
                if "abstract" in l.lower() or "@" in l or "university" in l.lower() or "department" in l.lower():
                    continue
                if len(l.split()) <= 6:
                    author_candidates.append(l)
            author = ", ".join(author_candidates) if author_candidates else "Unknown Author"

        return {
            "title": title,
            "author": author,
            "abstract": abstract,
            "total_pages": len(doc),
            "filename": filename
        }

    @classmethod
    def process_pdf(cls, file_path: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> Dict[str, Any]:
        """
        Parses a PDF into document metadata and page-level chunked nodes.
        """
        doc = fitz.open(file_path)
        filename = Path(file_path).name
        paper_id = str(uuid.uuid4())[:8]
        metadata = cls.extract_metadata(doc, filename)
        metadata["paper_id"] = paper_id
        metadata["file_path"] = str(file_path)

        chunks: List[Dict[str, Any]] = []
        full_text_pages: List[Dict[str, Any]] = []

        current_section = "Introduction / Overview"

        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_num = page_idx + 1
            page_text = page.get_text("text") or ""
            full_text_pages.append({
                "page": page_num,
                "text": page_text
            })

            # Check for section headers
            lines = page_text.split("\n")
            for line in lines:
                l_strip = line.strip()
                if re.match(r'^(?:(?:[0-9]{1,2}|[IVXLCDM]+)\.?\s+)?([A-Z][A-Za-z0-9\s,-]{2,40})$', l_strip):
                    if len(l_strip) < 45 and not l_strip.endswith('.'):
                        current_section = l_strip
                        break

            # Section and page-aware chunking
            clean_text = re.sub(r'\s+', ' ', page_text).strip()
            if not clean_text:
                continue

            # Split into chunks of chunk_size with overlap
            start = 0
            chunk_seq = 0
            while start < len(clean_text):
                end = min(start + chunk_size, len(clean_text))
                # Try to break on sentence boundary
                if end < len(clean_text):
                    last_period = clean_text.rfind('. ', start + chunk_size // 2, end)
                    if last_period != -1 and last_period > start:
                        end = last_period + 1

                chunk_content = clean_text[start:end].strip()
                if len(chunk_content) > 50:
                    chunk_id = f"{paper_id}_p{page_num}_c{chunk_seq}"
                    chunks.append({
                        "chunk_id": chunk_id,
                        "paper_id": paper_id,
                        "paper_title": metadata["title"],
                        "filename": filename,
                        "page": page_num,
                        "section": current_section,
                        "content": chunk_content,
                        "char_count": len(chunk_content)
                    })
                    chunk_seq += 1

                if end >= len(clean_text):
                    break
                start = max(start + 1, end - chunk_overlap)

        doc.close()
        return {
            "metadata": metadata,
            "chunks": chunks,
            "full_text_pages": full_text_pages
        }
