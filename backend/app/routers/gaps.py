from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.tools import identify_research_gaps

router = APIRouter(prefix="/gaps", tags=["gaps"])

class GapRequest(BaseModel):
    paper_ids: Optional[List[str]] = None
    topic: Optional[str] = None

@router.post("")
def analyze_gaps(req: GapRequest):
    result = identify_research_gaps.invoke({
        "paper_ids": req.paper_ids,
        "topic": req.topic
    })
    return result
