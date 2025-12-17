---
id: 1
title: Create Book RAG Chatbot Constitution
stage: constitution
date: 2025-12-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: SHANIYA ATIQ
command: /sp.constitution
labels: [constitution,spec-driven,book,rag,chatbot]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
---

## Prompt

```
/sp.constitution

Project: AI-Spec–Driven Book with Embedded RAG Chatbot

Objective:
Write and publish a technical book using Spec-Kit Plus and Claude Code with Docusaurus (GitHub Pages), and embed a RAG chatbot for book-aware Q&A.

Core Principles:
- Specification-first development
- Technical accuracy
- Reproducibility
- Developer-focused clarity

Standards:
- Authoring: Spec-Kit Plus + Claude Code
- Docs: Docusaurus → GitHub Pages
- Chatbot stack: OpenAI Agents/ChatKit, FastAPI, Neon Postgres, Qdrant Cloud (Free Tier)
- Answers from full book and user-selected text only
- Source-grounded responses

Constraints:
- Static, GitHub Pages–compatible
- Serverless-friendly, free-tier where specified

Success Criteria:
- Book deploys successfully
- Embedded RAG chatbot works correctly
- Selected-text Q&A supported
- End-to-end reproducibility
```

## Response snapshot

Updated the constitution template with specific details for the AI-Spec Driven Book with Embedded RAG Chatbot project, defining core principles around specification-first development, technical accuracy, developer-focused clarity, end-to-end integration, static site compatibility, and source-grounded responses. Added technical standards and development workflow sections aligned with the project objectives.

## Outcome

- ✅ Impact: Created foundational constitution document for the AI-Spec Driven Book with Embedded RAG Chatbot project
- 🧪 Tests: Not applicable
- 📁 Files: Updated .specify/memory/constitution.md with project-specific principles
- 🔁 Next prompts: Continue with specification and implementation phases
- 🧠 Reflection: Constitution establishes clear governance and principles for the project

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Begin specification phase