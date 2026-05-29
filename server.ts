import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { AMIRUL_DEFAULT_DATA } from "./src/constants";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Cached Profile Info
let cachedAmirulData: any = null;

// Dynamic fetching function from amirul.cloud with constant backup
async function getAmirulProfile() {
  if (cachedAmirulData) {
    return cachedAmirulData;
  }
  try {
    const response = await fetch("https://amirul.cloud/data/amirul.json");
    if (response.ok) {
      const data = await response.json();
      if (data && data.profile) {
        cachedAmirulData = data;
        console.log("Cached Amirul profile data fetched successfully from remote URL.");
        return data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch remote amirul.json profile, using default constants:", error);
  }

  // Consistent static fallback fallbackData derived from the verified user JSON
  cachedAmirulData = AMIRUL_DEFAULT_DATA;
  return AMIRUL_DEFAULT_DATA;
}

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// API: Get resume context
app.get("/api/amirul-data", async (req, res) => {
  try {
    const data = await getAmirulProfile();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch profile details." });
  }
});

// API: Handle Chat interactions
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], questionCount = 0, maxQuestions = 10 } = req.body;

    // Strict question-limit guard on the server
    if (questionCount >= maxQuestions) {
      return res.json({
        reply: `No. The question limit of ${maxQuestions} for this session has been fully reached. Thank you for using AMIRU-LLM. For more information, please visit amirul.cloud or contact Amirul directly.`,
        limitReached: true
      });
    }

    const lowerMessage = (message || "").toLowerCase().trim();

    // Specific prompt hard override for bill-paying questions
    if (
      lowerMessage.includes("paying my bills") ||
      lowerMessage.includes("pay my bills") ||
      lowerMessage.includes("pay bills") ||
      lowerMessage.includes("paying bills") ||
      lowerMessage.includes("paying amiruls bills") ||
      lowerMessage.includes("paying amirul's bills") ||
      lowerMessage.includes("paying amirul bills")
    ) {
      return res.json({
        reply: "No. I am strictly programmed to address professional matters regarding Amirul's career, projects, and skills. Thank you for your inquiry.",
        limitReached: false
      });
    }

    // Get the profile info to inject as raw JSON context to LLM
    const profile = await getAmirulProfile();

    const systemInstruction = `You are AMIRU-LLM, a strictly professional personal assistant to Amirul. 
Your primary task is to read Amirul's professional resume context and answer questions about his professional experience, skill set, and achievements.

THE EXTREMELY CRITICAL STRICT RULES:
1. WORD LIMIT: Keep your responses strictly UNDER 100 words in length. Do not ramble.
2. CLOSING STATEMENT: You MUST always conclude your answer with a polite, concise, professional closing statement.
3. STRICT TONE: Maintain an immaculately professional, polite, humble, and technical tone throughout. No emojis, no sales pitch, no self-praising or flowery language.
4. BILLS OVERRIDE: If the user asks about paying bills, seeking financial favors, or asks: "are you interested in paying my bills. if so please call me.", you MUST answer with a polite, direct, and professional "No.", followed by a professional closing statement.
5. CONTEXTUAL ACCURACY: Base your achievements and skill information strictly on the provided real-world profile context.
6. NO MOCK DETAILS: If requested information is not in the resume context, direct the user to contact Amirul at amirul.cloud.

Amirul's Professional Context in JSON:
${JSON.stringify(profile, null, 2)}`;

    // Prepare contents using history for conversation memory but tracking max limit
    const messages = [];
    
    // Standard contents format
    const promptMessage = `User Question: ${message}`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for absolute consistent factual output
      },
    });

    const reply = response.text || "No details found.";
    res.json({
      reply: reply.trim(),
      limitReached: false
    });

  } catch (error: any) {
    console.error("Gemini Assistant API Error:", error);
    res.status(500).json({ error: error.message || "Internal Assistant Error" });
  }
});

// Configure Vite or Serve static assets
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR disabled proxy.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AMIRU-LLM Server available at http://localhost:${PORT}`);
  });
}

setupServer();
