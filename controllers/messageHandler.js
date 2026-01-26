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
     const chatId = msg.chat.id;
        
        // ✅ Handle different media types
    if (msg.sticker) return bot.sendMessage(chatId, "A sticker huh? Try using an emoji instead 🥲");
    if (msg.photo) return bot.sendMessage(chatId, "I can't see images right now 😐! Wanna describe it? 🥹");
    if (msg.video) return bot.sendMessage(chatId, "A video? What's it about?");
    if (msg.voice) return bot.sendMessage(chatId, "You sound like a broken toy Just type.");
    if (!msg.text) return;

        // Ignore commands
        if(msg.text.includes("/")) return;
        
        const pending = {
            msgId: msg.message_id,
            chatId: chatId,
            userId: msg.from.id,
            username: msg.from.first_name,
            message: msg.text,
            chatType: msg.chat.type,
        };
        
        
        // Create "replied_to_message" for groups and supergroups
if (msg.chat.type !== 'private' && msg.chat.type !== 'channel') {
    const reply = msg.reply_to_message;
    const text =  msg.text.toLowerCase();
    const botTag = '@kathill';
    

    if (reply) {

        // Track if the bot itself is being replied to
        if (reply.from.username === 'kathill') {
            pending.botName = 'kathill';
        }

        // If it's a reply to the bot OR the bot is tagged
        if (reply.from.username === 'kathill' || text.includes(botTag)) {
            pending.replied_message = reply.text || reply.caption || "";
        }else{
            return
        }
    } else {
        /* If no reply, ONLY proceed if mentioned OR the bot is tagged
        Prevent reply if neither condition is met*/ 
        if (!text.includes('katelyn') && !text.includes(botTag)) {
            return;
        }
    }
}
        // Queue priority
        pending.userId == process.env.BOT_OWNER_ID ? queue.unshift(pending) : queue.push(pending);

        runQueue();
    });

    bot.on("polling_error", (err) => console.log("Polling Error:", err.message));
};
