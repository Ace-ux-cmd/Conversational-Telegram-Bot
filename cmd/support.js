module.exports = (bot) => {
    bot.onText(/\/support/, (msg) => {
        const chatId = msg.chat.id;

        const options = {
            reply_markup: {
                inline_keyboard: [
                [{ text: "🆘 Contact Support Gc", url: "https://t.me/katiespace" }],
                [{ text: "🤖 Join bot group", url: "https://t.me/AnnaLoungeHQ" }]
                ]
            }
        };

        bot.sendMessage(chatId, "Need help? Choose an option below:", options);
    });
};