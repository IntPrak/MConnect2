import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Server is running" });
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

app.post("/api/gemini", async (req, res) => {
    try {
        console.log("Received request from frontend.");
        const userMessage = req.body.message;
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        if (!response.ok) throw new Error("Failed to fetch response from API");

        const data = await response.json();
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Oops! No response generated.";
        
        console.log("Gemini API Response:", aiResponse);

        // Send response correctly
        res.json({ text: aiResponse });

    } catch (error) {
        console.error("Error calling Gemini API:", error.message);
        res.status(500).json({ error: "Error fetching response from Gemini API" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
