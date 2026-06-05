module.exports = (bot) => {
    // Listen for the "/callad" command
    bot.onText(/\/callad/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const options = {
                reply_to_message_id: msg.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Message Elvis", url: "https://t.me/chidalumb100" }],
                        [{ text: "Message Ace'", url: "https://t.me/elvismb10" }],
                        [{ text: "📱🟢💬 Message Admin on WhatsApp", url: "https://wa.me/+2347054971517" }],
                        [{ text: "📘💬 Add on Facebook", url: "https://www.facebook.com/profile.php?id=61578323177234" }]
                    ]
                }
            };

            // Send interactive support menu containing URL anchors
            const confirmation = await bot.sendMessage(chatId, "something on your mind?", options);

            // Establish an isolated 5-second auto-cleanup lifecycle hook
            setTimeout(async () => {
                try {
                    // Clean up both the interactive layout and incoming trigger text concurrently
                    await Promise.all([
                        bot.deleteMessage(chatId, confirmation.message_id).catch(() => {}),
                        bot.deleteMessage(chatId, msg.message_id).catch(() => {})
                    ]);
                } catch (timeoutErr) {
                    // Suppress deletion execution errors if items were removed early
                    console.error("Delayed message cleanup failed:", timeoutErr.message);
                }
            }, 5000);

        } catch (err) {
            console.error("Critical error inside /callad handler context:", err.message);
            
            // Fail safely without losing communication paths
            await bot.sendMessage(
                chatId, 
                "uh sorry, something broke trying to pull up those links lol. " +
                "you can just ping my admin directly here: https://t.me/chidalumb100"
            ).catch(() => {});
        } 
    });
};