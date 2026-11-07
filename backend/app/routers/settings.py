from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_manager import llm_manager

router = APIRouter(prefix="/settings", tags=["settings"])

class UpdateSettingsRequest(BaseModel):
    gemini_key: Optional[str] = None
    openai_key: Optional[str] = None
    provider: Optional[str] = None

@router.get("/status")
def get_settings_status():
    return llm_manager.get_status()

@router.post("/update")
def update_settings(req: UpdateSettingsRequest):
    llm_manager.update_keys(
        gemini_key=req.gemini_key,
        openai_key=req.openai_key,
        provider=req.provider
    )
    return {
        "status": "success",
        "current_status": llm_manager.get_status()
    }
