const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model: model,
        contents: "Hello"
      });
      console.log(`Success with ${model}: ${res.text}`);
    } catch (e) {
      console.log(`Failed with ${model}: ${e.message}`);
    }
  }
}
test();
