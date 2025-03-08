// test-api.js
import dotenv from 'dotenv';
dotenv.config();

// Log the loaded API key to verify it's being read correctly
console.log("Loaded API Key:", process.env.OPENAI_API_KEY);

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("API key is missing! Make sure it's defined in your .env file.");
  process.exit(1);
}

try {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();
  console.log("API Response:", data);
} catch (err) {
  console.error("Error:", err);
}