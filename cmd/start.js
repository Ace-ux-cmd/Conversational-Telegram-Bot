const activity = require("../utils/activity");

module.exports = (bot) => {
    // Listen for the "/start" command (clean, non-technical entry point)
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            // 1. The Clean, Low-Brain-Power User Guide & Features List
            const userGuide = 
                `✨ *WELCOME TO KATELYN* ✨\n\n` +
                `Hey! Glad you're here. This is the official home of Katelyn, your favorite sleep-deprived college barista virtual companion from Cali. \n\n` +
                `🤖 **What I Can Do:**\n` +
                `• **Real Conversations:** Text me like a normal human. I have memory, a real schedule, and a social battery.\n` +
                `• **Image Vision:** Send me any picture or meme. I can actually see them, critique them, or just roast them.\n` +
                `• **Group & Private Chat:** Add me to your groups or keep our text threads private.\n\n` +
                `📌 **Quick Navigation Commands:**\n` +
                `• /help — Get full command list\n` +
                `• /support — Get the official link to join our support group.\n` +
                `• /callad — Ping an admin immediately if something breaks or you just want to say hi.\n\n` +
                `*ALso don't forget to climb up the leaderboard to get exclusive admin previledges.*\n\n`;

            // Deliver the structured guide first
            await bot.sendMessage(chatId, userGuide, { parse_mode: "Markdown", disable_web_page_preview: false });

            // 2. Non-blocking Background Trigger for a simple, quick greeting
            setTimeout(async () => {
                try {
                    await bot.sendChatAction(chatId, "typing");
                    await new Promise(resolve => setTimeout(resolve, 800));
                    await bot.sendMessage(chatId, "oh hey. 🫠");
                } catch (timeoutErr) {
                    console.error("Delayed welcome greeting failed:", timeoutErr.message);
                }
            }, 1500);

        } catch (err) {
            console.error("Critical error in /start command execution handler:", err.message);
        }
    });
};