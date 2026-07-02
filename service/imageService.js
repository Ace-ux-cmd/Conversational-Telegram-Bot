// MODULE FOR AI RESPONSE GENERATION (IMAGE)


const { GoogleGenAI } = require('@google/genai');
const getRandomKey = require("../utils/keyRotation");
const { defaultConfig, adminConfig, ownerConfig } = require("../config/instruction");
const { getById } = require("../models/userModel"); 
const imageSchema = require("../config/imageSchema.json");

async function generateImageAnalysis(userId, username, promptText, structuralImagePart) {
    let assignedKey = null;

    try {
        // Passed userId into the lookup method execution block
        const user = await getById(userId);
        
        assignedKey = await getRandomKey();
        if (!assignedKey) {
            throw new Error("No operational API keys available in execution rotation array.");
        }

        const ai = new GoogleGenAI({ apiKey: assignedKey });
        const standardPrompt = promptText.trim() || "Analyze this image.";
        
        let systemInstructionText = defaultConfig;
        switch (user?.role) {
            case "owner":
                systemInstructionText += ownerConfig;
                break;
            case "admin":
                systemInstructionText += adminConfig;
                break;
        }

        systemInstructionText += `\n\n• Target User Name: ${username || "Anonymous"}\n`;

        // Execute dynamic request targeting structured output constraints
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: [
                { text: `User request/caption context: ${standardPrompt}` },
                structuralImagePart
            ],
            config: {
                systemInstruction: systemInstructionText,
                responseMimeType: "application/json",
                responseSchema: imageSchema
            }
        });

        // Parse outputs ensuring fallback data structures stand ready
        const structuredData = JSON.parse(response.text);
        return {
            chatResponse: structuredData.chatResponse || "uh, my bad... couldn't figure out what i'm looking at lol.",
            imageDescription: structuredData.imageDescription || "An image drop."
        };
    } catch (err) {
        throw new Error(`Gemini multimodal processing layer rejected query: ${err.message}`);
    }
}

module.exports = { generateImageAnalysis };