# 🧠 Nuvora Knowledge OS

A powerful knowledge management and AI-powered personal research assistant. Capture, organize, understand, and query your knowledge base.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup & Run Locally

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 🛠️ Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # TypeScript type checking
npm run preview  # Preview production build
```

## 📁 Project Structure

```
src/
├── components/     # React UI components
├── context/        # State management (KnowledgeContext)
├── services/       # Business logic (aiService)
├── data/          # Seed data
├── utils/         # Helper utilities
├── types.ts       # TypeScript types
├── App.tsx        # Root component
└── main.tsx       # Entry point
```

## ✨ Features

- **Universal Capture** - Save ideas, articles, notes, tasks from anywhere
- **AI Understanding** - Automatic tagging, categorization, entity extraction
- **Knowledge Base** - Organized, searchable personal research library
- **AI Ask** - Query your knowledge base with natural language
- **Collections** - Group related items
- **Projects** - Manage knowledge-driven projects
- **Tasks** - Extract and track actionable items
- **Graph View** - Visualize knowledge connections
- **Weekly Digest** - Insights and activity summary

## 🔧 Environment Setup

```env
# Optional - Gemini API key for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Server configuration
NODE_ENV=development
PORT=3000
```

## 📦 Tech Stack

**Frontend:**
- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS 4
- Lucide React (icons)
- Recharts (charts)
- Motion (animations)

**Backend:**
- Express.js
- Node.js
- Google Gemini AI (optional)
- Helmet (security)
- CORS (cross-origin)
- Rate limiting

## 🔐 Security Features

✅ **Request Validation** - Input sanitization & size limits  
✅ **Rate Limiting** - API throttling (100 req/15min)  
✅ **Security Headers** - CSP, HSTS, X-Frame-Options  
✅ **CORS** - Configurable origin restrictions  
✅ **Error Handling** - Safe error responses  
✅ **Offline Fallback** - Works without AI key  
✅ **Timeout Protection** - 30-second timeout on requests  

## 🤖 AI Capabilities

- **Understand** - Extract topics, entities, actions, insights from content
- **Ask** - Natural language query over knowledge base
- **Fallback** - Works without API key (local processing)
- **Model Resilience** - Automatic fallback to alternative models

## 💾 Knowledge Management

**Capture Types:**
- Notes & ideas
- Articles & references
- Meeting notes
- Task lists
- How-to guides
- Reflections & learnings

**Organization:**
- Collections (grouped knowledge)
- Projects (knowledge-driven work)
- Topics (automatic tagging)
- Search (full-text search)
- Graph (relationship mapping)

## 📝 License

MIT

---

**Nuvora Knowledge OS** — Your AI-powered knowledge management system.

Built for researchers, builders, and lifelong learners.
