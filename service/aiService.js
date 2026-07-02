// MODULE FOR AI RESPONSE GENERATION


const { GoogleGenAI } = require("@google/genai");
const { defaultConfig, adminConfig, ownerConfig } = require("../config/instruction");
const { generateVoiceFromText } = require("./voiceService");

const getRandomKey = require("../utils/keyRotation"); 
const invalidKeys = require("../utils/invalidKeys"); 
const { getHistory } = require("../models/messagesModel"); 
const formatHistory = require("../utils/formatHistory"); 
const deltaSeconds = require("../utils/deltaSeconds"); 
const activity = require("../utils/activity"); 
const { getById } = require("../models/userModel"); 

async function getAIResponse(currentUser, bot) {
    let assignedKey = null;

    try {
        const user = await getById(currentUser.userId);
        const userRole = user?.role || 'user';

        assignedKey = await getRandomKey();
        if (!assignedKey) {
            throw new Error("No operational API keys available in execution rotation array.");
        }

        currentUser.assignedKey = assignedKey;

        const ai = new GoogleGenAI({ apiKey: assignedKey });
        const scheduleContext = activity();
        const messageHistory = await getHistory(currentUser.userId).catch(() => []);
        
        let messages = formatHistory(messageHistory);
        const lastDelta = deltaSeconds(messageHistory);


        //  DETERMINISTIC ROUTING: Decide message type before generating content
        const shouldVoiceNote = Math.random() < 0.15 && currentUser.chatType === "private";

        let systemInstructionText = defaultConfig;

        switch (userRole) {
            case "owner":
                systemInstructionText += ownerConfig;
                break;
            case "admin":
                systemInstructionText += adminConfig;
                break;
        }

        systemInstructionText += 
            `\n\n[Runtime Context]\n` +
            `• Target User Name: ${currentUser.username || "Anonymous"}\n` +
            `• Environmental Activity: ${scheduleContext}\n` +
            `• The current time is ${new Date().toLocaleString("en-US", { 
                timeZone: "America/Los_Angeles",
                weekday: "long", year: "numeric", month: "long", day: "numeric",
                hour: "numeric", minute: "numeric"
            })}\n` +
            `• Delay Interval: +${lastDelta}s.\n` +
            `Use interval strictly to judge conversation pacing; do not copy or explicitly reference metrics in text.`;

        //  CONTEXT INJECTION: Give clear formatting rules based on the chosen modality
        if (shouldVoiceNote) {
            systemInstructionText += 
                `\n\n[MODALITY CRITICAL INSTRUCTION: VOICE OUTPUT]\n` +
                `• You are responding via a spoken audio note. Write your entire response as a direct transcript of what you will say.\n` +
                `• Keep it conversational, informal, and perfectly natural.\n` +
                `• DO NOT include any trailing emotion tags, meta-brackets, or text descriptors like "[emotion: ...]" anywhere in your response. Output clean spoken text only.`;
                bot.sendChatAction(currentUser.chatId, "record_voice");
        } 
        
        const responseWrapper = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: messages,
            config: {
                systemInstruction: systemInstructionText
            }
        });

        let rawAiResponse = responseWrapper.text;
        if (!rawAiResponse) return null;

        // EXECUTION PIPELINE: Route the final clean payload text appropriately
        if (shouldVoiceNote) {
            console.log(`[Voice Note Selected] Generating audio output context via key rotation for User: ${currentUser.userId}`);
            
            // Pass the clean, non-tagged textual spoken response into the TTS module
            const audioPayloadBuffer = await generateVoiceFromText(rawAiResponse.trim(), assignedKey, userRole, currentUser);
            
            return {
                success: true,
                type: "voice",
                payload: audioPayloadBuffer,
                transcript: rawAiResponse.trim()
            };
        }

        // Handle standard text response extraction and parsing
        const emotionRegex = /\[emotion:\s*(.*?)\]/i;
        const emotionMatch = rawAiResponse.match(emotionRegex);
        
        if (emotionMatch) {
            rawAiResponse = rawAiResponse.replace(emotionRegex, "").trim();
        }

        return rawAiResponse;

    } catch (err) {
        console.error("AI Generation Core Service Engine Exception:", err.message);

        const errorStatusCode = err.status || err.statusCode || (err.response ? err.response.status : null);
        const is429 = errorStatusCode === 429 || err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED");

        if (is429 && assignedKey) {
            invalidKeys.set(assignedKey, Date.now());
            return { success: false, errorType: "429" };
        }

        return { success: false, errorType: "503" };
    }
}

module.exports = { getAIResponse };