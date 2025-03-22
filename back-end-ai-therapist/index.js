import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// Global conversation history (shared by all users)
let conversationHistory = [];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  
  // If no message provided, return some default responses.
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "How are you feeling today?",
          facialExpression: "smile",
          animation: "Talking",
        },
        {
          text: "How are you feeling today?",
          facialExpression: "smile",
          animation: "Meeting",
        },
      ],
    });
    return;
  }
  
  // If API key is missing, send an error response.
  if (!geminiApiKey) {
    res.send({
      messages: [
        {
          text: "How are you feeling today?",
          facialExpression: "smile",
          animation: "Meeting",
        },
      ],
    });
    return;
  }
  
  // Append the user's message to the conversation history.
  conversationHistory.push(`User: ${userMessage}`);

  // Build the prompt including the conversation history.
  const prompt = `You are a virtual professional therapist.
You will always reply with a JSON array of messages (max 3 messages).
Each message has a "text", "facialExpression", and "animation" property.
Available facial expressions: "smile" and "default".
Available animations: "Idle" and "Talking".
Conversation history:
${conversationHistory.join("\n")}
Therapist:`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    
    // Get and log the raw response for debugging.
    const rawResponse = await geminiResponse.text();
    console.log("Raw Gemini API response:", rawResponse);
    
    const geminiResult = JSON.parse(rawResponse);

    if (!geminiResult || !geminiResult.candidates || geminiResult.candidates.length === 0) {
      throw new Error("Gemini API did not return any candidates");
    }
    
    const candidate = geminiResult.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Candidate content is undefined or empty");
    }
    
    // Extract text from the first part.
    let candidateText = candidate.content.parts[0].text;
    // Use a regex to extract JSON content from a Markdown code block.
    const match = candidateText.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      candidateText = match[1].trim();
    } else {
      candidateText = candidateText.trim();
    }
    
    let messages;
    try {
      messages = JSON.parse(candidateText);
    } catch (error) {
      console.error("Error parsing candidate text as JSON:", error, candidateText);
      throw error;
    }
    
    if (messages.messages) {
      messages = messages.messages;
    }
    
    // Append each therapist message to the conversation history.
    messages.forEach((msg) => {
      conversationHistory.push(`Therapist: ${msg.text}`);
    });
    
    // Return the parsed messages.
    res.send({ messages });
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    res.status(500).send({ error: "Failed to generate response" });
  }
});

app.listen(port, () => {
  console.log(`Therapist listening on port ${port}`);
});