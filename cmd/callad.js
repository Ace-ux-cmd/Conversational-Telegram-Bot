// Export a function that attaches handlers to the bot instance
module.exports = (bot) => {

    // Listen for the "/callad" command
    bot.onText(/\/callad/, (msg) => {

        // Send a message with inline buttons for contacting admins/support
        bot.sendMessage(
            msg.chat.id, // Target chat ID
            "Something on your mind?", // Prompt message
            {
                // Reply to the user's original message for context
                reply_to_message_id: msg.message_id,

                // Inline keyboard configuration (Telegram UI buttons)
                reply_markup: {
                    inline_keyboard: [
                        // Each inner array represents a row of buttons
                        [{ text: "Message Elvis", url: "https://t.me/chidalumb100" }],
                        [{ text: "Message Ace'", url: "https://t.me/elvismb10" }],
                        [{ text: "📱🟢💬 Message Admin on WhatsApp", url: "https://wa.me/+2347054971517" }],
                        [{ text: "📘💬 Add on Facebook", url: "https://www.facebook.com/profile.php?id=61578323177234" }]
                    ]
                }
            }
        )
    })
}