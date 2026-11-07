from typing import List, Dict, Any, Optional
from langchain_core.tools import tool
from app.services.vector_store import vector_store
from app.services.llm_manager import llm_manager

@tool
def retrieve_paper_context(query: str, paper_id: Optional[str] = None, top_k: int = 5) -> Dict[str, Any]:
    """
    Search vector store for relevant paper chunks, citations, and page references for a given query.
    """
    chunks = vector_store.search(query=query, top_k=top_k, paper_id=paper_id)
    citations = [c["citation"] for c in chunks]
    return {
        "query": query,
        "count": len(chunks),
        "citations": list(dict.fromkeys(citations)),
        "chunks": chunks
    }

@tool
def compare_research_papers(paper_ids: List[str], criteria: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Compare multiple research papers across objectives, methodologies, findings, and limitations.
    """
    if not criteria:
        criteria = ["Objectives & Motivation", "Methodology & Architecture", "Key Findings & Results", "Limitations & Trade-offs"]

    comparison_data = []
    all_citations = []

    for pid in paper_ids:
        # Retrieve chunks for this paper on objectives, methods, and limitations
        obj_chunks = vector_store.search(query="objective goal purpose motivation", top_k=2, paper_id=pid)
        method_chunks = vector_store.search(query="methodology architecture model training algorithm", top_k=2, paper_id=pid)
        results_chunks = vector_store.search(query="results findings performance benchmark accuracy", top_k=2, paper_id=pid)
        limit_chunks = vector_store.search(query="limitations weaknesses future work discussion", top_k=2, paper_id=pid)

        paper_title = obj_chunks[0]["paper_title"] if obj_chunks else (method_chunks[0]["paper_title"] if method_chunks else f"Paper {pid}")
        
        paper_citations = [c["citation"] for c in (obj_chunks + method_chunks + results_chunks + limit_chunks)]
        all_citations.extend(paper_citations)

        comparison_data.append({
            "paper_id": pid,
            "title": paper_title,
            "objectives": " ".join([c["content"] for c in obj_chunks])[:600],
            "methodology": " ".join([c["content"] for c in method_chunks])[:600],
            "findings": " ".join([c["content"] for c in results_chunks])[:600],
            "limitations": " ".join([c["content"] for c in limit_chunks])[:600],
            "citations": list(dict.fromkeys(paper_citations))
        })

    # Prepare prompt for LLM synthesis
    prompt = (
        f"You are an expert academic reviewer. Perform a structured comparative analysis of the following research papers.\n\n"
        f"Papers data:\n"
    )
    for p in comparison_data:
        prompt += (
            f"Paper: {p['title']} (ID: {p['paper_id']})\n"
            f"- Objectives: {p['objectives']}\n"
            f"- Methodology: {p['methodology']}\n"
            f"- Findings: {p['findings']}\n"
            f"- Limitations: {p['limitations']}\n"
            f"- Citations available: {', '.join(p['citations'])}\n\n"
        )
    prompt += (
        "Generate a comprehensive comparison including:\n"
        "1. Executive Comparative Summary\n"
        "2. A Markdown Comparison Table comparing Objectives, Methods, Datasets/Metrics, Findings, and Limitations\n"
        "3. Key Methodological Divergences\n"
        "4. Complementary Synergies (how these papers could be unified)\n"
        "Ensure every major claim has page-level citations."
    )

    synthesis = llm_manager.generate(
        prompt=prompt,
        system_prompt="You are an elite academic peer reviewer specializing in rigorous comparative literature analysis."
    )

    return {
        "papers": comparison_data,
        "synthesis": synthesis,
        "citations": list(dict.fromkeys(all_citations))
    }

@tool
def identify_research_gaps(paper_ids: Optional[List[str]] = None, topic: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze uploaded research papers to identify research gaps, unaddressed limitations, and future directions.
    """
    search_query = f"{topic or ''} limitations future work open problems unresolved challenges constraints failure cases".strip()
    
    retrieved_chunks = []
    if paper_ids:
        for pid in paper_ids:
            chunks = vector_store.search(query=search_query, top_k=4, paper_id=pid)
            retrieved_chunks.extend(chunks)
    else:
        retrieved_chunks = vector_store.search(query=search_query, top_k=8)

    context_lines = []
    citations = []
    for c in retrieved_chunks:
        citations.append(c["citation"])
        context_lines.append(f"Source: {c['citation']} (Section: {c['section']})\nExcerpt: {c['content']}\n")

    context_str = "\n".join(context_lines)

    prompt = (
        f"Context from uploaded academic papers:\n{context_str}\n\n"
        f"Task: Identify potential research gaps, unaddressed challenges, and novel research opportunities.\n"
        f"Focus: {topic if topic else 'General algorithmic, theoretical, and empirical gaps'}.\n\n"
        f"Structure your response as follows:\n"
        f"1. Executive Overview of Current Literature Boundaries\n"
        f"2. Methodological & Algorithmic Gaps (with page citations)\n"
        f"3. Empirical & Dataset Evaluation Gaps (with page citations)\n"
        f"4. Theoretical & Scaling Constraints (with page citations)\n"
        f"5. Formulated Novel Research Questions (actionable research problem statements for a PhD or thesis proposal)\n"
        f"Ensure strict grounding in the citations provided above."
    )

    analysis = llm_manager.generate(
        prompt=prompt,
        system_prompt="You are a senior academic research advisor and grant proposal reviewer."
    )

    return {
        "topic": topic,
        "retrieved_evidence": retrieved_chunks,
        "analysis": analysis,
        "citations": list(dict.fromkeys(citations))
    }

@tool
def extract_citations_and_sources(query: str, paper_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract exact scholarly citations, source page numbers, and direct verbatim evidence for a claim or topic.
    """
    chunks = vector_store.search(query=query, top_k=6, paper_id=paper_id)
    sources = []
    for c in chunks:
        sources.append({
            "citation": c["citation"],
            "paper_title": c["paper_title"],
            "page": c["page"],
            "section": c["section"],
            "excerpt": c["content"],
            "similarity_score": c["similarity_score"]
        })

    return {
        "query": query,
        "sources": sources,
        "total_sources": len(sources)
    }

@tool
def generate_structured_literature_review(paper_ids: List[str], focus_area: Optional[str] = None) -> Dict[str, Any]:
    """
    Synthesize uploaded papers into a structured, publication-grade academic literature review.
    """
    all_chunks = []
    for pid in paper_ids:
        chunks = vector_store.search(query=focus_area or "introduction methodology contribution results", top_k=3, paper_id=pid)
        all_chunks.extend(chunks)

    context_str = "\n".join([f"{c['citation']}: {c['content']}" for c in all_chunks])
    citations = list(dict.fromkeys([c["citation"] for c in all_chunks]))

    prompt = (
        f"Research context from indexed papers:\n{context_str}\n\n"
        f"Task: Write a rigorous, publication-grade Literature Review.\n"
        f"Specific Focus: {focus_area or 'Comprehensive Synthesis of the Field'}.\n\n"
        f"Include the following academic sections:\n"
        f"# Literature Review: {focus_area or 'State-of-the-Art in Selected Literature'}\n\n"
        f"## Abstract\n"
        f"A concise 150-word synthesis of the reviewed literature.\n\n"
        f"## 1. Introduction & Theoretical Background\n"
        f"Establish the research context, foundational paradigms, and problem statement.\n\n"
        f"## 2. Thematic Taxonomy of Approaches\n"
        f"Group the works into conceptual paradigms, contrasting their core algorithmic mechanics.\n\n"
        f"## 3. Comparative Methodological Matrix\n"
        f"Synthesize trade-offs, compute constraints, and empirical benchmarks.\n\n"
        f"## 4. Critical Gaps & Open Research Problems\n"
        f"Detail the unaddressed limitations across the analyzed works.\n\n"
        f"## 5. Conclusion & Future Outlook\n\n"
        f"## References & Grounding\n"
        f"List of all cited works with page numbers.\n\n"
        f"Strict requirement: Use [Paper Title, Page X] format for every factual claim."
    )

    review_text = llm_manager.generate(
        prompt=prompt,
        system_prompt="You are a distinguished university professor and academic survey author."
    )

    return {
        "focus_area": focus_area,
        "review": review_text,
        "citations": citations,
        "analyzed_papers_count": len(paper_ids)
    }

AVAILABLE_TOOLS = {
    "retrieve_paper_context": retrieve_paper_context,
    "compare_research_papers": compare_research_papers,
    "identify_research_gaps": identify_research_gaps,
    "extract_citations_and_sources": extract_citations_and_sources,
    "generate_structured_literature_review": generate_structured_literature_review
}

