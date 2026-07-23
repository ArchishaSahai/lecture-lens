# 🎓 LectureLens

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Powered-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Pinecone](https://img.shields.io/badge/Vector%20DB-Pinecone-6B45BC)](https://www.pinecone.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

LectureLens is an AI-powered Retrieval-Augmented Generation (RAG) application that lets students upload lecture subtitle files and chat with their course content in natural language. It grounds answers in the uploaded transcripts and provides timestamped source citations for easy verification.

## ✨ Features

- Upload ZIP archives containing `.vtt` and `.srt` subtitle files
- Automatically extract and parse subtitle transcripts
- Split transcripts into retrieval-ready chunks
- Generate OpenAI embeddings and store them in Pinecone
- Retrieve relevant context through LangChain-powered retrieval
- Chat naturally with uploaded lecture content
- View source citations with lecture names and timestamps
- Use a modern, ChatGPT-inspired interface
- Work comfortably in a dark-mode UI

## 🧰 Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| AI & Retrieval | LangChain, OpenAI, Pinecone |
| File Processing | React Dropzone, JSZip, subtitle parser |

## 🏗️ Architecture

```text
Upload ZIP
    ↓
Extract .vtt / .srt subtitle files
    ↓
Parse subtitles
    ↓
Create transcript chunks
    ↓
Generate OpenAI embeddings
    ↓
Store vectors in Pinecone
    ↓
Retrieve relevant chunks
    ↓
Generate grounded answers with timestamped citations
```

For overview-style questions, LectureLens retrieves representative context from every uploaded lecture. Specific questions continue to use semantic retrieval, with metadata-aware filtering for module-based queries.

## 📁 Folder Structure

```text
src/
├── app/          # Next.js pages and API routes
├── components/   # Chat, upload, and shared UI components
├── lib/          # OpenAI and Pinecone client configuration
├── services/     # Parsing, chunking, embeddings, retrieval, and LLM logic
└── types/        # Shared TypeScript types
```

## 🚀 Installation

### Prerequisites

- [Bun](https://bun.sh/)
- An OpenAI API key
- A Pinecone index configured for your embedding model's dimensions

```bash
git clone <your-repository-url>
cd lecture-lens
bun install
cp .env.example .env
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## 🔐 Environment Variables

Create a `.env` file from `.env.example` and add your credentials:

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
```

| Variable | Description |
| --- | --- |
| `OPENAI_API_KEY` | API key used for embeddings and answer generation |
| `PINECONE_API_KEY` | API key for your Pinecone project |
| `PINECONE_INDEX_NAME` | Name of the Pinecone vector index |

## 🖼️ Screenshots

> Add application screenshots here.

| Upload lectures | Chat with course content |
| --- | --- |
| `![Upload screen](./public/screenshots/upload.png)` | `![Chat screen](./public/screenshots/chat.png)` |

## 🔮 Future Improvements

- PDF support
- YouTube ingestion
- Website ingestion
- Streaming responses
- Persistent chat history
- Better retrieval strategies
- Multi-source RAG
- Hybrid search

## 📄 License

This project is licensed under the MIT License.
