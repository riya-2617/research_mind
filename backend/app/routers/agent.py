from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.agent import agent_workflow

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentChatRequest(BaseModel):
    query: str
    paper_id: Optional[str] = None

@router.post("/chat")
def chat_with_agent(req: AgentChatRequest):
    result = agent_workflow.run(query=req.query, paper_id=req.paper_id)
    return result
