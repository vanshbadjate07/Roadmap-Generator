const axios = require('axios');
const { spawn } = require('child_process');
require('dotenv').config();

// Start the server programmatically for the test if needed, but we'll assume we run it separately or it's running.
// Actually, let's just assume we'll run this script against the running server.
const BASE_URL = 'http://localhost:5001/api';

async function simulateUserScenario() {
    console.log(">>> STARTING SIMULATION: Machine Learning (Beginner) <<<");

    // 1. Generate
    console.log("[1/3] Generating Roadmap...");
    try {
        const genRes = await axios.post(`${BASE_URL}/generate`, {
            topic: "Machine Learning",
            level: "Beginner",
            goal: "2 Months",
            skills: "Basic Python"
        });

        const roadmapData = genRes.data;
        if (!roadmapData.steps || roadmapData.steps.length === 0) {
            throw new Error("Generation returned empty steps!");
        }
        console.log("   ✅ Generation Success! Title:", roadmapData.title);

        // 2. Save
        console.log("[2/3] Saving Roadmap...");
        const saveRes = await axios.post(`${BASE_URL}/save`, {
            roadmap: {
                ...roadmapData,
                topic: "Machine Learning",
                level: "Beginner",
                knownSkills: "Basic Python"
            },
            userId: "simulation-user-final-test"
        });

        const savedId = saveRes.data.id;
        if (!savedId) throw new Error("No ID returned from save!");
        console.log("   ✅ Save Success! ID:", savedId);

        // 3. Fetch (Immediately)
        console.log("[3/3] Fetching Roadmap...");
        const getRes = await axios.get(`${BASE_URL}/roadmaps/${savedId}`);

        if (getRes.data.id === savedId) {
            console.log("   ✅ Fetch Success! The roadmap exists and is retrievable.");
            console.log("\n>>> SIMULATION FLAWLESS <<<");
        } else {
            throw new Error("ID mismatch on fetch.");
        }

    } catch (error) {
        console.error("\n❌ SIMULATION FAILED");
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Data:", error.response.data);
        } else {
            console.error("   Error:", error.message);
        }
        process.exit(1);
    }
}

// Check if server is up, if not, warn user (or in this agent case, we ensure it's up)
simulateUserScenario();
