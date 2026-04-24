// Import Gemini AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import system prompts (persona + admin mode)
const { defaultConfig, adminConfig } = require("../config/instruction");

// Import user memory handler (DB fetch/create)
const getUser = require("../controllers/authController");

/**
 * Generates AI response for a private user conversation
 * Maintains context using stored message history in MongoDB
 */
async function getAIResponse(currentUser) {

    // List of API keys for load balancing / fallback rotation
    const apiKeys = [
        process.env.GOOGLE_API_KEY1,
        process.env.GOOGLE_API_KEY7,
        process.env.GOOGLE_API_KEY8,
        process.env.GOOGLE_API_KEY9,
        process.env.GOOGLE_API_KEY0
    ];

    // Randomly select an API key to distribute request load
    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    // Initialize Gemini client with selected key
    const genAI = new GoogleGenerativeAI(randomKey);

    // Base system instruction (persona definition)
    let system = defaultConfig;

    // Apply elevated admin behavior if request comes from bot owner
    if (currentUser.userId == process.env.BOT_OWNER_ID) {
        system += ` ${adminConfig}`;
    }

    // Configure model with system instruction and runtime context
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: `${system}. User's name: ${currentUser.username}. Time: ${(new Date()).toLocaleString()}.`
    });

    // Load or create user memory record
    const user = await getUser(currentUser.userId, currentUser.username);

    // Append latest user message to conversation history
    user.messages.push({
        role: "user",
        parts: [{ text: currentUser.message }]
    });

    // Keep only last 10 messages to limit context size
    user.messages = user.messages.slice(-10);

    try {

        // Generate AI response using full conversation context
        const result = await model.generateContent({
            contents: user.messages
        });

        // Extract response text from Gemini output
        const aiResponse = result.response.text();

        // Store AI response in conversation history
        user.messages.push({
            role: "model",
            parts: [{ text: aiResponse }]
        });

        // Maintain rolling context window
        user.messages = user.messages.slice(-10);

        // Persist updated history to database
        await user.save();

        return aiResponse;

    } catch (e) {

        // Log failure for debugging
        console.error("AI Service Error:", e.message);

        // Rate-limit handling
        if (e.status === 429) return "Slow down with the messages, would you?";

        // Generic failure fallback
        return null;
    }
}

// Export AI service function
module.exports = { getAIResponse };