module.exports = (bot) => {
    // Listen for the "/support" command
    bot.onText(/\/support/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🆘 Contact Support Gc", url: "https://t.me/katiespace" }],
                        [{ text: "🤖 Join bot group", url: "https://t.me/AnnaLoungeHQ" }]
                    ]
                }
            };

            // Deliver the support choice menu to the active chat channel
            const confirmation = await bot.sendMessage(chatId, "here, pick what you need 👇", options);

            // Establish an isolated 5-second automatic message deletion cleanup cycle
            setTimeout(async () => {
                try {
                    // Erase both the user's execution trigger and the menu card concurrently
                    await Promise.all([
                        bot.deleteMessage(chatId, confirmation.message_id).catch(() => {}),
                        bot.deleteMessage(chatId, msg.message_id).catch(() => {})
                    ]);
                } catch (timeoutErr) {
                    // Intercept and swallow exceptions if a user pre-deleted a message line manually
                    console.error("Support message automatic cleanup failed:", timeoutErr.message);
                }
            }, 5000);

        } catch (err) {
            console.error("Critical routing error inside /support execution handler:", err.message);
        }
    });
};