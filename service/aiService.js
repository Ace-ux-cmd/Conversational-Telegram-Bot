const { GoogleGenAI } = require("@google/genai");

// Trailing behavioral configurations based on user status tier matrices
const { defaultConfig, adminConfig, ownerConfig } = require("../config/instruction");

// Core infrastructural dependencies and load balancing utility hooks
const getRandomKey = require("../utils/keyRotation"); 
const invalidKeys = require("../utils/invalidKeys"); 
const { getHistory } = require("../models/messagesModel"); 
const formatHistory = require("../utils/formatHistory"); 
const deltaSeconds = require("../utils/deltaSeconds"); 
const activity = require("../utils/activity"); 
const { getById } = require("../models/userModel"); 
const { trackFailedMessage } = require("../utils/rateLimitQueue");

async function getAIResponse(currentUser, bot) {
    // Declare outside block scope to guarantee catch block accessibility during runtime failures
    let assignedKey = null;

    try {
        // Fetch complete profile metrics from storage engine
        const user = await getById(currentUser.userId);
        
        // Stop processing if the account is currently marked as banned
        if (user?.status === "banned") {
            return "yeah i'm not supposed be talking to you rn. if you think this is a mistake, type /callad and sort it out.";
        }

        // Pull an active key string from rotation array
        assignedKey = await getRandomKey();
        if (!assignedKey) {
            throw new Error("No operational API keys available in execution rotation array.");
        }

        // Initialize unified client instance matching the latest @google/genai SDK specifications
        const ai = new GoogleGenAI({ apiKey: assignedKey });

        // Compile situational background state metrics
        const scheduleContext = activity();
        const messageHistory = await getHistory(currentUser.userId).catch(() => []);
        const messages = formatHistory(messageHistory);
        const lastDelta = deltaSeconds(messageHistory);

        // Assemble base target identity text rule configuration lines
        let systemInstructionText = defaultConfig;

        switch (user?.role) {
            case "owner":
                systemInstructionText += ownerConfig;
                break;
            case "admin":
                systemInstructionText += adminConfig;
                break;
        }

        // Append real-time metadata constraints dynamically to focus performance metrics
        systemInstructionText += 
            `\n\n[Runtime Context]\n` +
            `• Target User Name: ${currentUser.username || "Anonymous"}\n` +
            `• Environmental Activity: ${scheduleContext}\n` +
            `• Current Timestamp in california: ${new Date().toLocaleString("en-US", { 
    timeZone: "America/Los_Angeles",
    weekday: "long",
    year: "numeric",
    month: "long", 
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
})}\n` +
            `• Delay Interval: +${lastDelta}s.\n` +
            `Use interval strictly to judge conversation pacing; do not copy or explicitly reference metrics in text.`+
            `• And Don't send non-text responses\n` ;

        // Complete generation call using the updated SDK standards
        const responseWrapper = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: messages,
            config: {
                systemInstruction: systemInstructionText
            }
        });

        // Resolve text block output from the finalized schema response wrapper object
        const aiResponse = responseWrapper.text;
        return aiResponse || null;

   } catch (err) {
    console.error("AI Generation Core Service Engine Exception:", err.message);

    // Handle Resource Constraints: Isolate and temporarily blacklist keys throwing 429 errors
    const errorStatusCode = err.status || err.statusCode || (err.response ? err.response.status : null);
    
    if ((errorStatusCode === 429 || err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED")) && assignedKey) {
        // Log timestamp signature into the tracking cache layer to pause selection cycles
        invalidKeys.set(assignedKey, Date.now());

        trackFailedMessage(currentUser.userId, bot, currentUser);

        // Randomized array of Katelyn's little sister hijacking her phone
      const sisterReplies = [
    "hiii this is her sister lol she said she'll be back dont go anywhere",
    "uh she's not looking at her phone rn but she told me to tell u she'll reply laterrr 🤫",
    "hey stop texting her choice of words she's busy atm!! i'll tell her u messaged tho",
    "she went to get coffee or something but she said she'll text back when she's free do not leave lol",
    "omg she literally just put her phone down two seconds ago. typical. i'll let her know u texted 🙄",
    "hiiii not kate obviously lol. she's doing that thing where she stares at the ceiling and calls it thinking. she'll be back",
    "she said and i quote 'tell them i'll be back' so. she'll be back. don't stress 😭",
    "bro she just walked out the room with her headphones on. u know how she gets. give her a min",
    "this is so embarrassing but she handed me her phone and said cover for me so. hi. she'll text u back",
    "she's literally right there but she's in her zone rn u know how it is. i'll poke her 😭",
    "kate said she's coming back but she also said that 20 mins ago so. no promises lol",
    "she just went to do something real quick she'll be right back!! she said don't go anywhere fr"
];

        // Safely extract a random index from the pool
        const randomReply = sisterReplies[Math.floor(Math.random() * sisterReplies.length)];

        return randomReply;
    }

    // Catch-all safety boundary drop out prevents system loops from freezing the runtime engine
    return null;
}
}

module.exports = { getAIResponse };
