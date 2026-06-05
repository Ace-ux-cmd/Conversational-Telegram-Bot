const helpData = require('../config/cmd.json'); 

module.exports = (bot) => {
    // Listen for the "/help" command
    bot.onText(/\/help/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            // Re-voiced the menu header to match Katelyn's signature style
            let helpMessage = "✨ <b>look what we have here... your breakdown:</b> ✨\n\n";

            // Iterate dynamically across root layout categories in your JSON config
            for (const category in helpData) {
                helpMessage += `📂 <b>${category}</b>\n`;
                const commands = helpData[category];

                // Map across individual command strings within current group block
                for (const cmd in commands) {
                    const details = commands[cmd].details;
                    const usageRaw = commands[cmd].usage;
                    
                    // Escape raw angle brackets so Telegram doesn't parse them as HTML tags
                    const safeUsage = usageRaw
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    
                    // Formats inline command strings safely alongside explicit execution syntax parameters
                    helpMessage += `• <code>${safeUsage}</code>\n  <i>${details}</i>\n`;
                }

                helpMessage += "\n"; // Structural spacing padding between blocks
            }

            // Deliver dynamic, styled HTML menu string directly to origin channel context
            const confirmation = await bot.sendMessage(chatId, helpMessage.trim(), {
                parse_mode: "HTML",
                reply_to_message_id: msg.message_id
            });

            // Clean up the text logs after 60 seconds so the chat doesn't get cluttered
            setTimeout(async () => {
                try {
                    await Promise.all([
                        bot.deleteMessage(chatId, confirmation.message_id).catch(() => {}),
                        bot.deleteMessage(chatId, msg.message_id).catch(() => {})
                    ]);
                } catch (timeoutErr) {
                    // Suppress deletion errors if users pre-purged lines manually
                    console.error("Help system automatic layout cleanup failed:", timeoutErr.message);
                }
            }, 60000);

        } catch (err) {
            console.error("Critical error in /help command execution handler:", err.message);
            
            // Re-voiced catch block statement to sound identical to her native error feedback loops
            await bot.sendMessage(
                chatId, 
                "uh, my head hurts trying to pull up that menu list right now lol. give it another shot? 🫠",
                { reply_to_message_id: msg.message_id }
            ).catch(() => {});
        }
    });
};