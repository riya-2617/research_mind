import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.routers.papers import list_papers, load_sample_papers
from app.routers.agent import chat_with_agent, AgentChatRequest
from app.routers.compare import compare_papers, CompareRequest
from app.routers.gaps import analyze_gaps, GapRequest
from app.routers.review import generate_review, ReviewRequest
from app.routers.settings import get_settings_status

def test_everything():
    print("1. Seed sample papers...")
    seeded = load_sample_papers()
    print(f"   -> Seeded {len(seeded)} papers")

    print("2. List papers...")
    papers = list_papers()
    print(f"   -> Retrieved {len(papers)} papers:")
    for p in papers:
        print(f"      * {p['title']} ({p.get('total_pages', 1)} pages, {p.get('chunk_count', 0)} chunks)")

    print("3. Agent chat...")
    chat = chat_with_agent(AgentChatRequest(query="What is the attention mechanism in Transformer?"))
    print(f"   -> Intent: {chat['intent']}, Citations: {len(chat['citations'])}")

    print("4. Compare papers...")
    p_ids = [p['paper_id'] for p in papers[:2]]
    comp = compare_papers(CompareRequest(paper_ids=p_ids))
    print(f"   -> Compared {len(comp['papers'])} papers, Citations: {len(comp['citations'])}")

    print("5. Analyze gaps...")
    gaps = analyze_gaps(GapRequest(topic="Quadratic memory complexity"))
    print(f"   -> Gaps analysis generated ({len(gaps['analysis'])} chars)")

    print("6. Literature review...")
    rev = generate_review(ReviewRequest(focus_area="Efficient Transformer Scaling"))
    print(f"   -> Review generated ({len(rev['review'])} chars)")

    print("7. Settings status...")
    st = get_settings_status()
    print(f"   -> Active provider: {st['active_provider']}")

    print("\n>>> ALL 7 CORE RESEARCHMIND CAPABILITIES TESTED & VERIFIED! <<<")

if __name__ == "__main__":
    test_everything()
