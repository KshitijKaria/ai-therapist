import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in your .env file.");
  process.exit(1);
}

const geminiApiKey = process.env.GEMINI_API_KEY;

const payload = {
  contents: [
    {
      parts: [{ text: "Explain how AI works" }]
    }
  ]
};

try {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await response.json();
  console.log("Gemini API Response:", data);
} catch (error) {
  console.error("Error calling Gemini API:", error);
}