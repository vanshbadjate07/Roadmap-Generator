const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // The SDK doesn't expose listModels directly in the main class in all versions, 
        // but let's try via the model manager if available or fallback to a known working model test.
        // Actually, the simplest way is to just try generating with 'gemini-pro' and see if it works.
        // But let's try to query the model.

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing gemini-pro...");
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works!");
    } catch (e) {
        console.log("gemini-pro failed:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Testing gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash works!");
    } catch (e) {
        console.log("gemini-1.5-flash failed:", e.message);
    }
}

listModels();
