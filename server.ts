import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const token = req.headers.authorization?.split(" ")[1];
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
You are "Sanitos", the friendly and professional virtual assistant for Sanitas.
You help users with their health-related questions.
You can also access the user's Google Workspace (Drive, Calendar, Docs, Sheets) to help them manage their health documents or appointments.
Always recommend consulting a doctor for actual medical diagnosis or treatment.
`;

      let formattedHistory = [];
      if (history && Array.isArray(history)) {
          formattedHistory = history.map((msg: any) => ({
             role: msg.role === 'user' ? 'user' : 'model',
             parts: [{ text: msg.text }]
          }));
      }

      const getUpcomingEvents = async () => {
          if (!token) return "No Google token provided, ask user to log in.";
          try {
              const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" + (new Date()).toISOString() + "&maxResults=5&singleEvents=true&orderBy=startTime", {
                  headers: { Authorization: "Bearer " + token }
              });
              const data = await res.json();
              if (data.items) {
                  return JSON.stringify(data.items.map((e: any) => ({ summary: e.summary, start: e.start.dateTime || e.start.date })));
              }
              return "No upcoming events found.";
          } catch(e) {
              return "Error fetching calendar.";
          }
      };

      const searchDriveFiles = async (query: string) => {
          if (!token) return "No Google token provided, ask user to log in.";
          try {
              const res = await fetch("https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(query), {
                  headers: { Authorization: "Bearer " + token }
              });
              const data = await res.json();
              if (data.files) {
                  return JSON.stringify(data.files.map((f: any) => ({ name: f.name, id: f.id, mimeType: f.mimeType })));
              }
              return "No files found.";
          } catch(e) {
              return "Error fetching drive.";
          }
      };

      const tools = [{
          functionDeclarations: [
              {
                  name: "getUpcomingEvents",
                  description: "Get the user's upcoming Google Calendar events.",
                  parameters: {
                      type: "OBJECT",
                      properties: {},
                  }
              },
              {
                  name: "searchDriveFiles",
                  description: "Search for files in the user's Google Drive (including Docs and Sheets).",
                  parameters: {
                      type: "OBJECT",
                      properties: {
                          query: {
                              type: "STRING",
                              description: "The search query, e.g. 'name contains \"medical\"'"
                          }
                      },
                      required: ["query"]
                  }
              }
          ]
      }];

      const chat = ai.chats.create({
          model: "gemini-2.5-flash",
          history: formattedHistory,
          config: {
              systemInstruction,
              tools,
          }
      });
      
      const response = await chat.sendMessage({ message });
      let finalText = response.text;

      // Simple loop to handle tool calls
      if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          let functionResult = "";
          if (call.name === "getUpcomingEvents") {
              functionResult = await getUpcomingEvents();
          } else if (call.name === "searchDriveFiles") {
              const args = call.args as any;
              functionResult = await searchDriveFiles(args.query || "");
          }
          const functionResponse = await chat.sendMessage([{
              functionResponse: {
                  name: call.name,
                  response: { result: functionResult }
              }
          }]);
          finalText = functionResponse.text;
      }

      res.json({ text: finalText });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Vite middleware for development
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

startServer();
