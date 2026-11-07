from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.agent import agent_workflow

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentChatRequest(BaseModel):
    query: str
    paper_id: Optional[str] = None
    image_data: Optional[str] = Field(None, description="Base64 data URL of uploaded diagram, chart, or architecture figure")
    mime_type: Optional[str] = Field("image/png", description="Image MIME type (e.g. image/png, image/jpeg)")

@router.post("/chat")
def chat_with_agent(req: AgentChatRequest):
    result = agent_workflow.run(
        query=req.query, 
        paper_id=req.paper_id,
        image_data=req.image_data,
        mime_type=req.mime_type or "image/png"
    )
    return result
