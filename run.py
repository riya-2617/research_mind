"""
RESEARCHMIND - Application Launcher
Runs the full-stack agentic research assistant.
"""
import sys
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
VENV_PYTHON = BASE_DIR / ".venv" / "Scripts" / "python.exe"

python_bin = str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable

def run_server():
    print("=" * 70)
    print("   RESEARCHMIND - Agentic AI Research Assistant")
    print("=" * 70)
    print(f"[*] Workspace Root: {BASE_DIR}")
    print(f"[*] Python Executable: {python_bin}")
    print("[*] ChromaDB Vector Database initialized in data/chroma_db")
    print("[*] LangGraph Multi-Tool Agent Ready")
    print("[*] Serving Application at: http://localhost:8000")
    print("=" * 70)

    # Set PYTHONPATH
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)

    # Start FastAPI with Uvicorn
    cmd = [
        python_bin, "-m", "uvicorn", 
        "app.main:app", 
        "--host", "0.0.0.0", 
        "--port", "8000", 
        "--reload"
    ]
    subprocess.run(cmd, cwd=str(BACKEND_DIR), env=env)

if __name__ == "__main__":
    run_server()

