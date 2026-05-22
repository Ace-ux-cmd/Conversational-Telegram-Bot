// Import Gemini AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import system instruction config (persona + admin mode)
const { defaultConfig, adminConfig } = require("../config/instruction");

/**
 * Generates AI response for group chat context
 * Handles reply context + message formatting for conversational continuity
 */
async function aiGroupResponse(currentUser) {

    // Base system prompt defining bot personality
    let system = defaultConfig;

    // Elevated behavior for bot owner
    if (currentUser.userId == process.env.BOT_OWNER_ID) {
        system += ` ${adminConfig}`;
    }

    // Random key selection for load balancing
     const getRandomKey = require("../utils/keyRotation");
 const randomKey = await getRandomKey();


    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(randomKey);

    // Configure model with system instruction + runtime context
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: `${system}. User's name: ${currentUser.username}. Time: ${(new Date()).toLocaleString()}.`
    });

    /**
     * Format current user message into Gemini chat structure
     */
    const currentMessages = [
        {
            role: "user",
            parts: [{ text: currentUser.message }]
        }
    ];

    /**
     * If message is a reply in a group,
     * prepend context of the original message being replied to
     */
    if (currentUser.replied_message) {
        currentMessages.unshift({
            role: 'user',
            parts: [{
                text: `[Context - replied to message]: "${currentUser.replied_message}"`
            }]
        });
    }

    try {

        // Start chat session using previous messages as history (excluding latest)
        const chat = model.startChat({
            history: currentMessages.slice(0, -1)
        });

        // Extract last user message to send as prompt
        const lastMessage =
            currentMessages[currentMessages.length - 1].parts[0].text;

        // Send message to model and wait for response
        const responses = await chat.sendMessage(lastMessage);

        // Return AI-generated text response
        return responses.response.text();

    } catch (err) {

        // Log error for debugging purposes
        console.error("Group ai Service Error:", err);

        // Handle rate limiting
        if (err.status === 429) {
            return "Too many messages at once, give it a second before sending more.";
        }

        // Generic failure fallback
        return null;
    }
}

// Export group AI response handler
module.exports = { aiGroupResponse };