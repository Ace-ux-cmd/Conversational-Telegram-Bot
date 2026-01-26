const { OpenAI } = require("openai");
const { defaultConfig, adminConfig } = require("../config/instruction");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function aiGroupResponse(currentUser) {


    // Setup system instructions locally
    let system = defaultConfig;
    if (currentUser.userId == process.env.BOT_OWNER_ID) system += ` ${adminConfig}`;

    //  Format the current message into the "messages" format the AI expects
    // Since there's no DB unlike in private, we just process the current input
    const currentMessages = [
        { role: "user", content: currentUser.message }
    ];


// Identify the sender of each replied message by assigning roles.
    if(currentUser.replied_message) {
    let role = currentUser.botName == 'kathill_bot' ? 'assistant' : 'user'
        currentMessages.unshift ({ role: role, content: currentUser.replied_message })
    }

        // Fallback Logic: GPT-4o-mini
        try {
            const responses = await openai.responses.create({
                model: "gpt-4o-mini",
                instructions: system,
                input: currentMessages, 
                max_output_tokens: 200
            });
            return responses.output_text;
            
        } catch (err) {
            console.error("AI Service Error:", err);
            return null; 
        }
    }

// Export the function
module.exports = { aiGroupResponse };