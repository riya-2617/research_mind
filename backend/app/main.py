import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pymupdf as fitz

from app.config import settings, FIGURES_DIR
from app.routers import papers, rag, agent, compare, gaps, review, settings as settings_router, figures
from app.services.sample_papers_generator import generate_sample_pdfs
from app.services.pdf_processor import PDFProcessor
from app.services.vector_store import vector_store
from app.services.paper_store import paper_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure landmark papers are seeded and visual figures rendered
    try:
        sample_files = generate_sample_pdfs()
        existing_papers = paper_store.get_all()
        
        # Check if papers need initial seeding
        if len(existing_papers) == 0:
            for file_path in sample_files:
                processed = PDFProcessor.process_pdf(file_path)
                metadata = processed["metadata"]
                chunks = processed["chunks"]
                vector_store.add_chunks(chunks)
                paper_record = {
                    "paper_id": metadata["paper_id"],
                    "title": metadata["title"],
                    "author": metadata["author"],
                    "abstract": metadata["abstract"],
                    "total_pages": metadata["total_pages"],
                    "filename": metadata["filename"],
                    "chunk_count": len(chunks),
                    "file_path": metadata["file_path"],
                    "full_text_pages": processed["full_text_pages"],
                    "figures": processed.get("figures", [])
                }
                paper_store.save(paper_record)
            print(f"[Lifespan] Seeded {len(sample_files)} sample papers with multimodal figures.")
        else:
            # Ensure visual figure PNGs exist for all indexed papers
            for p in existing_papers:
                fp = p.get("file_path", "")
                pid = p.get("paper_id")
                if fp and Path(fp).exists() and pid:
                    doc = fitz.open(fp)
                    for p_idx in range(len(doc)):
                        p_num = p_idx + 1
                        fig_name = f"{pid}_p{p_num}.png"
                        fig_path = FIGURES_DIR / fig_name
                        if not fig_path.exists():
                            pix = doc[p_idx].get_pixmap(dpi=120)
                            pix.save(str(fig_path))
                    doc.close()
    except Exception as e:
        print(f"[Lifespan] Startup seed error: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Agentic AI Research Assistant for Academic Paper Analysis, Figure Inspection, and Literature Synthesis",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(papers.router, prefix=settings.API_V1_STR)
app.include_router(rag.router, prefix=settings.API_V1_STR)
app.include_router(agent.router, prefix=settings.API_V1_STR)
app.include_router(compare.router, prefix=settings.API_V1_STR)
app.include_router(gaps.router, prefix=settings.API_V1_STR)
app.include_router(review.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)
app.include_router(figures.router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "indexed_papers": len(paper_store.get_all()),
        "multimodal_enabled": True
    }

# SPA Static Serving
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
