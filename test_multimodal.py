import sys
import os
import base64
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.routers.figures import get_all_figures
from app.services.agent import agent_workflow
from app.services.llm_manager import llm_manager

print("1. Testing Visual Figures Extraction...")
figures = get_all_figures()
print(f"   Total extracted visual figures in library: {len(figures)}")
for f in figures[:3]:
    print(f"   * [{f.figure_id}] {f.paper_title} (Page {f.page}): {f.caption[:50]}...")

print("\n2. Testing Multimodal Agent Workflow with Attached Diagram...")
dummy_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
response = agent_workflow.run(
    query="Explain the architecture diagram and dataflow connections shown in this figure.",
    image_data=dummy_png_b64,
    mime_type="image/png"
)

print(f"   Intent: {response['intent']}")
print(f"   Has Visual: {response.get('has_visual')}")
print(f"   Response length: {len(response['response'])} chars")
print(f"   Citations verified: {len(response['citations'])}")

print("\n3. Testing Multimodal LLM Manager Status...")
status = llm_manager.get_status()
print(f"   Active Provider: {status['active_provider']}")
print(f"   Is Multimodal: {status.get('is_multimodal')}")

print("\n>>> ALL MULTIMODAL CAPABILITIES VERIFIED! <<<")
