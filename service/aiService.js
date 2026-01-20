const { OpenAI } = require("openai");
const { defaultConfig, adminConfig } = require("../config/instruction");
const getUser = require("../controllers/authController");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function getAIResponse(currentUser) {
    let system = defaultConfig;
    if (currentUser.userId == process.env.BOT_OWNER_ID) system += ` ${adminConfig}`;

    const user = await getUser(currentUser.userId, currentUser.username);
    
    // Add new message
    user.messages.push({ role: "user", content: currentUser.message });

    // Keep the last 5 in the DB (Database Management)
    // We use slice here so user.messages stays exactly 5 items long
    user.messages = user.messages.slice(-5);
    
    try {
        // Primary attempt: Send all 5 messages to gpt-5-nano
        const responses = await openai.responses.create({
            model: "gpt-5-nano",
            instructions: `${system}. User name: ${currentUser.username}. Time: ${(new Date()).toLocaleString()}.`,
            input: user.messages, 
            temperature: 1.3,
            reasoning: { effort: "minimal" }
        });
        const aiResponse = responses.output_text;
        user.messages.push({ role: "assistant", content: aiResponse });
        
        // Final trim to ensure we don't save more than 5 after AI replies
        user.messages = user.messages.slice(-5);
        await user.save();
        return aiResponse;

    } catch (e) {
        // Fallback Logic: GPT-4o-mini
        try {
            const responses = await openai.responses.create({
                model: "gpt-4o-mini",
                instructions: system,
                /* Only send the 2 most recent messages (AI Context Management)
                 This does NOT change the 5 messages stored in user.messages*/
                input: user.messages.slice(-2), 
                max_output_tokens: 200
            });
            const aiResponse = responses.output_text;
            user.messages.push({ role: "assistant", content: aiResponse });
            
            // Final trim before saving to DB
            user.messages = user.messages.slice(-5);
            await user.save();
            return aiResponse;
            
        } catch (err) {
            console.error("AI Service Error:", err);
            return null; 
        }
    }
}

module.exports = { getAIResponse };
