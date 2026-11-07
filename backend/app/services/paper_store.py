import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import DATA_DIR

PAPERS_FILE = DATA_DIR / "papers.json"

class PaperStore:
    def __init__(self):
        self.file_path = PAPERS_FILE
        self._ensure_file()

    def _ensure_file(self):
        if not self.file_path.exists():
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def get_all(self) -> List[Dict[str, Any]]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return list(data.values())
        except Exception:
            return []

    def get_by_id(self, paper_id: str) -> Optional[Dict[str, Any]]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get(paper_id)
        except Exception:
            return None

    def save(self, paper_data: Dict[str, Any]):
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            data[paper_data["paper_id"]] = paper_data
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving paper: {e}")

    def delete(self, paper_id: str):
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if paper_id in data:
                del data[paper_id]
                with open(self.file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error deleting paper: {e}")

paper_store = PaperStore()

