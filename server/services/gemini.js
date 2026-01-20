const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateRoadmapContent = async (topic, level, skills, goal, duration, hoursPerDay) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
        Create a highly detailed, industry-ready learning roadmap for: "${topic}".
        Level: ${level}
        Current Skills: ${skills || "None"}
        Goal: ${goal || "Mastery"}
        Target Duration: ${duration || "Flexible"}
        Daily Compelling Commitment: ${hoursPerDay || "Flexible"} hours/day

        Task: Provide a structured, day-wise or week-wise plan that fits the duration.
        For each step (Concept, Benefit, Project), provide extremely specific resources and a "deep dive" explanation.

        Return STRICTLY valid JSON. No markdown formatting. Structure:
        {
            "title": "Professional Roadmap Title",
            "description": "Comprehensive overview",
            "estimated_total_time": "e.g. 40 hours",
            "steps": [
                {
                    "step_number": 1,
                    "title": "Step Title",
                    "type": "Concept" | "Project" | "Milestone",
                    "time_allocation": "e.g. Day 1-2 (4 hours)",
                    "description": "High-level summary",
                    "detailedNotes": "In-depth explanation of the concept, why it matters, and key terms.",
                    "resources": [
                        {"label": "Official Docs / Tutorial", "url": "https://..."}
                    ],
                    "outcomes": "Specific skill acquisition"
                }
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Raw Response:", text); // FULL LOG

        // Clean up markdown code blocks if Gemini adds them
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '');
        try {
            return JSON.parse(cleanedText);
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError);
            console.error("Failed text:", cleanedText);
            throw new Error("AI returned invalid JSON: " + cleanedText.substring(0, 100));
        }
    } catch (error) {
        console.error("Gemini General Error:", error);
        throw new Error(error.message);
    }
};

module.exports = { generateRoadmapContent };
