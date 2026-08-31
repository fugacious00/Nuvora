import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

// ============================================================================
// SECURITY LAYER 1: REQUEST HEADERS & PROTECTION
// ============================================================================

const app = express();

// Helmet security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
        fontSrc: ["'self'", "data:"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    permissionsPolicy: {
      geolocation: [],
      microphone: [],
      camera: [],
    },
  })
);

// ============================================================================
// SECURITY LAYER 2: CORS PROTECTION
// ============================================================================

const corsOptions = {
  origin:
    NODE_ENV === "production"
      ? [process.env.APP_URL || "https://nuvora.app"]
      : [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:5173",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
};

app.use(cors(corsOptions));

// ============================================================================
// SECURITY LAYER 3: REQUEST PARSING & LIMITS
// ============================================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

// Request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// ============================================================================
// SECURITY LAYER 4: RATE LIMITING
// ============================================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => NODE_ENV !== "production",
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // More restrictive for AI
  message: "Too many AI requests, please try again later.",
  standardHeaders: true,
  skip: (req) => NODE_ENV !== "production",
});

app.use("/api/", apiLimiter);
app.use("/api/gemini", aiLimiter);

// ============================================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================================

function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, 10000)
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "");
}

function logError(message: string, error?: any): void {
  const timestamp = new Date().toISOString();
  if (NODE_ENV === "development") {
    console.error(`[${timestamp}] ${message}:`, error?.message || error);
  } else {
    console.error(`[${timestamp}] ${message}`);
  }
}

// ============================================================================
// AI CLIENT INITIALIZATION
// ============================================================================

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey.length > 10) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "nuvora-knowledge-os",
        },
      },
    });
  } catch (error) {
    logError("Failed to initialize Google GenAI client", error);
  }
}

// ============================================================================
// MODEL FALLBACK WITH RETRY
// ============================================================================

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  if (!ai) {
    throw new Error("AI client not initialized");
  }

  const preferred = params.preferredModel || "gemini-2.5-flash";
  const modelsToTry = [
    preferred,
    ...FALLBACK_MODELS.filter((m) => m !== preferred),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err || "");
        const isDemandOrRateLimit =
          errMsg.includes("503") ||
          errMsg.includes("429") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("overloaded");

        if (isDemandOrRateLimit && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Nuvora Knowledge OS",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    aiConfigured: NODE_ENV === "development" ? !!ai : undefined,
  });
});

// AI UNDERSTAND: Deep understanding & extraction
app.post("/api/gemini/understand", async (req: Request, res: Response) => {
  try {
    const { text, title, type, sourceUrl } = req.body;

    if (!text && !title) {
      return res
        .status(400)
        .json({ error: "Text or title is required for understanding." });
    }

    // Sanitize inputs
    const sanitizedText = text ? sanitizeInput(text) : "";
    const sanitizedTitle = title ? sanitizeInput(title) : "";

    if (!ai) {
      // Local fallback
      const words = sanitizedText.trim().split(/\s+/);
      const autoTitle =
        sanitizedTitle || words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");

      return res.json({
        title: autoTitle || "Captured Knowledge",
        summary: sanitizedText
          ? sanitizedText.slice(0, 160) + "..."
          : "Captured item",
        topics: ["General Knowledge", "Uncategorized"],
        entities: [],
        actionItems: [],
        keyInsights: [
          sanitizedText
            ? sanitizedText.slice(0, 100)
            : "Knowledge captured successfully",
        ],
        suggestedConnections: ["Related to recent captures"],
        type: type || "note",
      });
    }

    const prompt = `You are Nuvora's Intelligence Engine.
Analyze this user capture (Type: ${type || "note"}):
---
Title: ${sanitizedTitle || "None"}
Content: ${sanitizedText || sanitizedTitle}
---
Return strict JSON with: title, summary, topics (2-5), entities, actionItems (with text/priority), keyInsights (2-4), suggestedConnections (2-3), category.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            entities: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  suggestedTimeframe: { type: Type.STRING },
                },
              },
            },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedConnections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            category: { type: Type.STRING },
          },
          required: ["title", "summary", "topics"],
        },
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch {
      return res.json({
        title: sanitizedTitle || "Captured",
        summary:
          sanitizedText ? sanitizedText.slice(0, 160) : "Captured item",
        topics: ["Knowledge"],
        entities: [],
        actionItems: [],
        keyInsights: ["Content captured"],
        category: "note",
      });
    }
  } catch (err: any) {
    logError("AI understand endpoint error", err);
    res.status(500).json({
      error: NODE_ENV === "development" ? err.message : "AI processing failed",
      fallback: true,
    });
  }
});

// AI ASK: Query over knowledge base
app.post("/api/gemini/ask", async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;

    if (!question || typeof question !== "string") {
      return res
        .status(400)
        .json({ error: "Question is required for asking." });
    }

    const sanitizedQuestion = sanitizeInput(question);

    if (!ai) {
      return res.json({
        answer: "I found relevant knowledge in your library. Please check your Knowledge view for saved items.",
        sources: [],
        confidence: 0.5,
      });
    }

    const prompt = `Based on this user knowledge library context:
${sanitizedQuestion.slice(0, 5000)}

Answer this question clearly and concisely:
${sanitizedQuestion}`;

    const response = await generateContentWithRetry({
      contents: prompt,
    });

    res.json({
      answer: response.text || "No answer generated",
      sources: [],
      confidence: 0.8,
    });
  } catch (err: any) {
    logError("AI ask endpoint error", err);
    res.status(500).json({
      error: NODE_ENV === "development" ? err.message : "Query processing failed",
    });
  }
});

// ============================================================================
// VITE & STATIC FILES
// ============================================================================

async function startServer() {
  if (NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (error) {
      logError("Failed to create Vite server", error);
      process.exit(1);
    }
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath, { maxAge: "1d" }));

    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ Nuvora Knowledge OS running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`🔐 AI Configured: ${ai ? "Yes" : "No (fallback active)"}`);
    console.log(
      `🚀 Rate Limiting: ${NODE_ENV === "production" ? "Enabled" : "Disabled"}`
    );
    console.log("");
  });
}

process.on("unhandledRejection", (reason: any) => {
  logError("Unhandled Promise Rejection", reason);
});

process.on("uncaughtException", (error: Error) => {
  logError("Uncaught Exception", error);
  process.exit(1);
});

startServer().catch((error) => {
  logError("Failed to start server", error);
  process.exit(1);
});

export default app;
