---
id: project-portfolio-rag-assistant
title: Portfolio RAG Assistant — Portfolio questions and grounded answers
category: projects
topics:
- Full-stack engineering
- AI application engineering
- Python
- Large language models
- Retrieval-augmented generation
- Semantic search
- Grounded generation
- Evaluation
entities:
- Favour Chukwuemerie Ututu
- Portfolio RAG Assistant
- LangChain
- OpenAI
- Chroma
- Gradio
aliases:
- Portfolio AI assistant
provenance:
- path: rag/sources/confirmed-portfolio-details.md
  sections:
  - Evaluation-driven evidence boundaries — 19 November 2026
  - Professional positioning and portfolio RAG implementation
---

# Portfolio RAG Assistant — Portfolio questions and grounded answers

**Type:** Independent AI application project.

**Contribution:** Curated knowledge, Python ingestion and answering pipelines, evaluation tooling, and Gradio testing interfaces.

**Repository:** https://github.com/faelic/portfolio

## Overview and contribution

Favour built the Portfolio RAG Assistant to answer visitor questions about his background, professional experience, contributions, and projects. He organized the portfolio knowledge into topic documents and implemented the Python pipelines that retrieve supporting passages and generate grounded answers. Relevant repository links direct visitors to deeper implementation explanations.

## Python implementation and retrieval

The Portfolio RAG Assistant uses Python, LangChain, OpenAI embeddings and chat models, Chroma, and Gradio. Its ingestion pipeline loads curated Markdown, extracts YAML metadata separately from searchable text, preserves document identity and section metadata, and creates deterministic heading-aware chunks. The local synchronization workflow upserts current chunks before deleting obsolete records.

The answering pipeline performs semantic retrieval and constructs a grounded answer from the retrieved passages. For conversation follow-ups, it rewrites the question into a standalone retrieval query while preserving the original question for answering. The documented configuration uses text-embedding-3-large for embeddings and gpt-4.1-mini for answering.

## Evaluation and testing interfaces

Favour implemented a 50-question evaluation dataset with reference answers, answerability labels, and document-and-section evidence groups. Retrieval metrics include mean reciprocal rank (MRR) and section-based evidence-group coverage. Structured answer judging scores accuracy, completeness, relevance, and grounding.

Gradio interfaces support chat with retrieved-passage inspection, single-case evaluation, and sequential batch evaluation with category charts and individual feedback. Offline tests check implementation behavior with storage and providers mocked; they do not establish real retrieval or generated-answer quality.

This knowledge entry does not supply a verified overall answer-accuracy
figure. A dataset, judge, metric implementation, or passing mocked test is
not a measured quality result and does not prove overall correctness.
No verified numeric quality figure is supplied here. A separate AI-assisted
assessment is AI-assisted evidence, not independent human validation or
production accuracy.

## Availability and limitations

Public availability through Favour's portfolio was confirmed by Favour on 11 November 2026. The approved code link is https://github.com/faelic/portfolio; public availability has not been independently verified by the corpus authoring process.

The assistant is bounded by its curated evidence. It does not automatically browse GitHub, and the corpus provides no measured retrieval-quality, production-scale, or uptime guarantees. The RAG implementation does not establish deployment of autonomous agents, model training, or fine-tuning.
