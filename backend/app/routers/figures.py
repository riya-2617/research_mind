from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.config import FIGURES_DIR
from app.services.paper_store import paper_store

router = APIRouter(prefix="/figures", tags=["figures"])

class FigureResponse(BaseModel):
    figure_id: str
    paper_id: str
    paper_title: str
    page: int
    caption: str
    section: str
    image_url: str
    filename: str

@router.get("", response_model=List[FigureResponse])
def get_all_figures():
    """
    Returns all visual figures, architecture diagrams, and empirical plots
    extracted from the indexed academic paper library.
    """
    all_papers = paper_store.get_all()
    figures = []
    
    for p in all_papers:
        paper_id = p.get("paper_id")
        paper_title = p.get("title", "Untitled Paper")
        total_pages = p.get("total_pages", 1)
        
        # Check stored figures list or scan rendered page figures
        p_figs = p.get("figures", [])
        if p_figs:
            for f in p_figs:
                figures.append(FigureResponse(
                    figure_id=f.get("figure_id", f"{paper_id}_p1"),
                    paper_id=paper_id,
                    paper_title=paper_title,
                    page=f.get("page", 1),
                    caption=f.get("caption", f"Visual figure from {paper_title}"),
                    section=f.get("section", "Methodology / Architecture"),
                    image_url=f.get("image_url", f"/api/figures/image/{paper_id}_p1.png"),
                    filename=f.get("filename", f"{paper_id}_p1.png")
                ))
        else:
            # Fallback: scan for any rendered images for this paper
            for page_num in range(1, total_pages + 1):
                fname = f"{paper_id}_p{page_num}.png"
                fpath = FIGURES_DIR / fname
                if fpath.exists():
                    figures.append(FigureResponse(
                        figure_id=f"{paper_id}_p{page_num}",
                        paper_id=paper_id,
                        paper_title=paper_title,
                        page=page_num,
                        caption=f"Visual architecture diagram & empirical findings (Page {page_num})",
                        section=f"Page {page_num} Section",
                        image_url=f"/api/figures/image/{fname}",
                        filename=fname
                    ))
                    
    return figures

@router.get("/paper/{paper_id}", response_model=List[FigureResponse])
def get_paper_figures(paper_id: str):
    """
    Returns figures and diagrams for a specific paper.
    """
    all_figs = get_all_figures()
    return [f for f in all_figs if f.paper_id == paper_id]

@router.get("/image/{filename}")
def serve_figure_image(filename: str):
    """
    Serves the rendered high-resolution figure or diagram image file.
    """
    fpath = FIGURES_DIR / filename
    if not fpath.exists():
        raise HTTPException(status_code=404, detail="Figure image not found")
    return FileResponse(str(fpath), media_type="image/png")
