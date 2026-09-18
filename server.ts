import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.post("/api/login", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user) {
      await getOrCreateUser(req.user.uid, req.user.email || '');
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Login failed", message: error.message });
  }
});

app.post("/api/export-slides", requireAuth, async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: 'Missing Google access token' });

    const { roadmapData } = req.body;
    if (!roadmapData) return res.status(400).json({ error: 'Missing roadmap data' });

    // Create a new presentation
    const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Career Trajectory: ${roadmapData.careerTitle}`
      })
    });
    
    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("Slides API Error:", errText);
      return res.status(createRes.status).json({ error: "Failed to create presentation", details: errText });
    }

    const presentation = await createRes.json();
    const presentationId = presentation.presentationId;

    // We can add basic slides here by updating the presentation
    // For simplicity, we just return the presentation link
    // and ideally add one title slide and one content slide
    const requests = [
      {
        createSlide: {
          objectId: "slide_1",
          slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" }
        }
      },
      {
        insertText: {
          objectId: "slide_1",
          text: `Your Career Path: ${roadmapData.careerTitle}\n\n${roadmapData.description}`
        }
      }
    ];

    await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    res.json({ success: true, presentationId, url: `https://docs.google.com/presentation/d/${presentationId}/edit` });
  } catch (error: any) {
    console.error("Export Error Details:", error);
    res.status(500).json({ error: "Export failed", message: error.message });
  }
});

// API routes
app.post("/api/analyze-career", async (req, res) => {
  try {
    const { answers } = req.body;

    const prompt = `You are a high-level Career Strategy AI. Analyze these career assessment responses and provide a deep analysis.
    Based on the answers, suggest the single best career path.
    
    IMPORTANT: The careerTitle must be ONLY the job title itself (e.g. "Software Engineer", "Product Manager"). Do not include any descriptions or extra words in this field.
    
    Return a JSON object with the following structure:
    {
      "careerTitle": "Strictly just the job title.",
      "description": "A sophisticated 3-4 sentence explanation of why this fits the user.",
      "steps": [
        { "title": "string", "description": "string", "duration": "string" }
      ],
      "salaryData": [
        { "region": "India", "entry": number, "mid": number, "senior": number, "currency": "INR" },
        { "region": "Global", "entry": number, "mid": number, "senior": number, "currency": "USD" }
      ],
      "skillsToAcquire": ["string"]
    }
    
    Answers: ${JSON.stringify(answers)}`;

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    if (!result.text) {
      console.error("Gemini returned empty text");
      throw new Error("Empty response from AI");
    }

    try {
      res.json(JSON.parse(result.text));
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", result.text);
      // Fallback: try to strip markdown if present (though responseMimeType should prevent it)
      const cleaned = result.text.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    }
  } catch (error: any) {
    console.error("Analysis Error Details:", error);
    res.status(500).json({ error: "Analysis failed", message: error.message });
  }
});

app.post("/api/interview-feedback", async (req, res) => {
  try {
    const { transcript, careerPath } = req.body;
    const prompt = `Provide sophisticated, constructive feedback for a mock interview for the career path: ${careerPath}.
    Transcript: ${JSON.stringify(transcript)}
    Focus on strategic communication, technical depth, and industry-specific terminology.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt
    });
    res.json({ feedback: result.text });
  } catch (error) {
    res.status(500).json({ error: "Feedback generation failed" });
  }
});

app.post("/api/optimize-resume", async (req, res) => {
  try {
    const { resumeText, targetCareer } = req.body;
    const prompt = `You are an expert Executive Resume Writer. Optimize this resume for the role of ${targetCareer}.
    
    Return a JSON object with:
    {
      "optimizedText": "The full optimized resume text",
      "suggestions": ["suggestion 1", "suggestion 2", ...],
      "keywordsAdded": ["keyword1", "keyword2", ...]
    }
    
    Resume: ${resumeText}`;

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    res.json(JSON.parse(result.text || "{}"));
  } catch (error) {
    console.error("Resume Optimization Error:", error);
    res.status(500).json({ error: "Resume optimization failed" });
  }
});

// Vite middleware
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
