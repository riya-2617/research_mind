from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.tools import compare_research_papers
from app.services.paper_store import paper_store

router = APIRouter(prefix="/compare", tags=["compare"])

class CompareRequest(BaseModel):
    paper_ids: List[str]
    criteria: Optional[List[str]] = None

@router.post("")
def compare_papers(req: CompareRequest):
    if not req.paper_ids:
        # Default to first 3 papers if not specified
        all_papers = paper_store.get_all()
        req.paper_ids = [p["paper_id"] for p in all_papers[:3]]

    result = compare_research_papers.invoke({
        "paper_ids": req.paper_ids,
        "criteria": req.criteria
    })
    return result
