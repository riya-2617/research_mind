from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.tools import generate_structured_literature_review
from app.services.paper_store import paper_store

router = APIRouter(prefix="/review", tags=["review"])

class ReviewRequest(BaseModel):
    paper_ids: Optional[List[str]] = None
    focus_area: Optional[str] = None

@router.post("")
def generate_review(req: ReviewRequest):
    paper_ids = req.paper_ids
    if not paper_ids:
        all_papers = paper_store.get_all()
        paper_ids = [p["paper_id"] for p in all_papers[:5]]

    result = generate_structured_literature_review.invoke({
        "paper_ids": paper_ids,
        "focus_area": req.focus_area
    })
    return result
