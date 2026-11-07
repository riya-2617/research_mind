import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import papers, rag, agent, compare, gaps, review, settings as settings_router
from app.services.paper_store import paper_store
from app.services.sample_papers_generator import generate_sample_pdfs
from app.services.pdf_processor import PDFProcessor
from app.services.vector_store import vector_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed sample papers if empty
    try:
        existing = paper_store.get_all()
        if len(existing) == 0:
            print("[Lifespan] Seeding initial academic papers into ChromaDB...")
            sample_files = generate_sample_pdfs()
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
                    "full_text_pages": processed["full_text_pages"]
                }
                paper_store.save(paper_record)
            print(f"[Lifespan] Seeded {len(sample_files)} sample papers successfully.")
    except Exception as e:
        print(f"[Lifespan] Startup seed error: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agentic AI Research Assistant for Academic Paper Analysis, RAG, and Comparison",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Register routers
app.include_router(papers.router, prefix=settings.API_V1_STR)
app.include_router(rag.router, prefix=settings.API_V1_STR)
app.include_router(agent.router, prefix=settings.API_V1_STR)
app.include_router(compare.router, prefix=settings.API_V1_STR)
app.include_router(gaps.router, prefix=settings.API_V1_STR)
app.include_router(review.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "indexed_papers": len(paper_store.get_all())
    }

# SPA Static Serving
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept api routes
        if full_path.startswith("api/") or full_path == "api":
            return {"error": "Endpoint not found"}
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "Frontend build not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
