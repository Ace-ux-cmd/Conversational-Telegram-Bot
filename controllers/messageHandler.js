const { processUserRequest } = require("./botController");
const queue = [];
let isProcessing = false;

module.exports = (bot) => {
    
    const runQueue = async () => {
        if (isProcessing || queue.length === 0) return;
        isProcessing = true;

        while (queue.length > 0) {
            const nextUser = queue.shift();
            await processUserRequest(bot, nextUser);
        }

        isProcessing = false;
    };

    bot.on("message", async (msg) => {
       
        // Ignore commands

        if(msg.text.includes("/")) return;
        
        // ✅ Handle different media types
    if (msg.sticker) return bot.sendMessage(chatId, "A sticker huh? Try using an emoji instead 🥲");
    if (msg.photo) return bot.sendMessage(chatId, "I can't see images right now 😐! Wanna describe it? 🥹");
    if (msg.video) return bot.sendMessage(chatId, "A video? What's it about?");
    if (msg.voice) return bot.sendMessage(chatId, "You sound like a broken toy Just type.");
    if (!msg.text) return;

        if(msg.chat.type !== 'private') return;
        
        const pending = {
            msgId: msg.message_id,
            userId: msg.chat.id,
            username: msg.from.first_name,
            message: msg.text
        };

        // Queue priority
        pending.userId == process.env.BOT_OWNER_ID ? queue.unshift(pending) : queue.push(pending);

        runQueue();
    });

    bot.on("polling_error", (err) => console.log("Polling Error:", err.message));
};
