import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.routers.papers import get_paper_catalog, add_catalog_paper, add_custom_paper, CustomPaperRequest, add_paper_from_arxiv, ArxivRequest

print("1. Testing Catalog listing...")
catalog = get_paper_catalog()
print(f"   Catalog entries count: {len(catalog)}")
for c in catalog:
    print(f"   * [{c.id}] {c.title} (indexed={c.is_indexed})")

print("\n2. Testing 1-click catalog addition for LLaMA...")
p = add_catalog_paper("llama")
print(f"   Added paper: '{p['title']}', chunks={p['chunk_count']}")

print("\n3. Testing custom paper creation...")
custom_p = add_custom_paper(CustomPaperRequest(
    title="Hybrid State Space Models for Long Sequences",
    author="ResearchMind Academic Team",
    abstract="An empirical study evaluating selective state space models against quadratic attention mechanisms.",
    methodology="Hardware-aware selective scan kernels with SRAM cache tiling.",
    findings="Achieves linear compute complexity O(N) with 4.5x faster generation throughput.",
    limitations="Lack of associative memory on multi-hop associative recall tasks."
))
print(f"   Created custom paper: '{custom_p['title']}', chunks={custom_p['chunk_count']}")

print("\n4. Testing ArXiv import...")
arxiv_p = add_paper_from_arxiv(ArxivRequest(query="2305.14314"))
print(f"   Imported ArXiv paper: '{arxiv_p['title']}', chunks={arxiv_p['chunk_count']}")

print("\n>>> ALL PAPER ADDITION CAPABILITIES SUCCESSFULLY VERIFIED! <<<")

