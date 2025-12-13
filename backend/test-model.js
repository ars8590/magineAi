import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("Loaded KEY:", process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-latest" });
// If "gemini-pro" fails, try: "gemini-1.0-pro" or "gemini-1.0-pro-latest"

try {
  const r = await model.generateContent("Say hello in Malayalam.");
  console.log("MODEL RESPONSE:", r.response.text());
} catch (e) {
  console.error("MODEL ERROR:", e.toString());
}
