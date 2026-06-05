module.exports = (bot) => {
    // Listen for the "/start" command (entry point for new users)
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        // Fall back gracefully if first_name isn't present on the chat object
        const name = msg.chat.first_name || "there";

        try {
            // Conversational, imperfect entry point matching Katelyn's persona
            const welcomeMessage = 
                `hey ${name.toLowerCase()} 👋 just sat down in the dorms, my brain is kind of fried from classes lol\n\n` +
                `i'm katelyn. out here in cali figuring out freshman year. i text back when i can, just don't go crazy 😴\n\n` +
                `anyway here's what you can run if you're looking for things:\n` +
                `• /about - if you're actually curious about me\n` +
                `• /support - group links and updates\n` +
                `• /callad - if something breaks and you need an admin\n\n` +
                `okay yeah. hi 🫠`;

            // Deliver the personalized text securely to the chat thread origin
            await bot.sendMessage(chatId, welcomeMessage);

        } catch (err) {
            console.error("Critical error in /start command execution handler:", err.message);
        }
    });
};