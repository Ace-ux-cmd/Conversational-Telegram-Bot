// Export a function that attaches the /support command handler
module.exports = (bot) => {

    // Listen for the "/support" command
    bot.onText(/\/support/, (msg) => {

        // Extract chat ID for reuse (target where the response will be sent)
        const chatId = msg.chat.id;

        // Define inline keyboard options for support navigation
        const options = {
            reply_markup: {
                inline_keyboard: [
                    // Each inner array is a row; each object is a button with a URL
                    [{ text: "🆘 Contact Support Gc", url: "https://t.me/katiespace" }],
                    [{ text: "🤖 Join bot group", url: "https://t.me/AnnaLoungeHQ" }]
                ]
            }
        };

        // Send the support message with attached inline buttons
        bot.sendMessage(chatId, "Need help? Choose an option below:", options);
    });
};