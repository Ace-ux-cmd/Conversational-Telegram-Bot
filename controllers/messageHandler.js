// Import message processor (handles AI response generation + sending)
const { processUserRequest } = require("./botController");

// Queue system state
const queue = [];          // Holds incoming user requests
let isProcessing = false;  // Prevents concurrent queue execution

// Export bot setup function
module.exports = (bot) => {

    /**
     * Core queue runner
     * Processes one user at a time with controlled delay
     */
    const runQueue = async () => {

        // Stop if already processing or queue is empty
        if (isProcessing || queue.length === 0) return;

        isProcessing = true;

        // Take next user request from queue (FIFO)
        const nextUser = queue.shift();

        try {

            // Process user message through AI pipeline
            const retryUser = await processUserRequest(bot, nextUser);

            // If processing requires retry, re-queue based on retry rules
            if (retryUser) {

                if (retryUser.retries >= 2) {

                    // Hard cooldown retry: reinsert after 15 minutes
                    setTimeout(() => {
                        queue.push(retryUser);
                        runQueue();
                    }, 15 * 60 * 1000);

                } else {

                    // Soft retry: push back into queue immediately
                    queue.push(retryUser);
                }
            }

        } catch (err) {
            console.error("Queue Task Error:", err);
        } finally {

            // Always release lock after a short cooldown
            setTimeout(() => {
                isProcessing = false;
                runQueue();
            }, 3000);
        }
    };

    /**
     * Main message handler
     * Filters media, validates input, and queues valid messages
     */
    bot.on("message", async (msg) => {

        const chatId = msg.chat.id;

        // Reject unsupported media types with quick responses
        if (msg.sticker) return bot.sendMessage(chatId, "A sticker huh? Try using an emoji instead 🥲");
        if (msg.photo) return bot.sendMessage(chatId, "I can't see images right now 😐! Wanna describe it? 🥹");
        if (msg.video) return bot.sendMessage(chatId, "A video? What's it about?");
        if (msg.voice) return bot.sendMessage(chatId, "Not a phone call kinda person, type it out instead 🙂");

        
        // Ignore non-text messages
        if (!msg.text) return;

        // Ignore bot commands
        if (msg.text.includes("/")) return;

        // Base request object passed into processing pipeline
        const pending = {
            msgId: msg.message_id,
            chatId: chatId,
            userId: msg.from.id,
            username: msg.from.first_name,
            message: msg.text,
            chatType: msg.chat.type,
            retries: 0
        };

        /**
         * Group chat filtering logic
         * Ensures bot only responds when explicitly mentioned or replied to
         */
        if (msg.chat.type !== 'private' && msg.chat.type !== 'channel') {

            const reply = msg.reply_to_message;
            const text = msg.text.toLowerCase();
            const botTag = '@kathill';

            // If replying directly to bot message, attach context
            if (reply && reply.from.username === 'kathill_bot') {

                pending.botName = 'kathill';
                pending.replied_message = reply.text || reply.caption || "";

            } 
            // Otherwise ignore unless bot is mentioned
            else if (!text.includes('katelyn') && !text.includes(botTag) && !text.includes("kat")) {
                return;
            }
        }

        // Queue prioritization:
        // owner requests go to front, others go to back
        if (pending.userId == process.env.BOT_OWNER_ID) {
            queue.unshift(pending);
        } else {
            queue.push(pending);
        }

        // Start queue processing loop
        runQueue();
    });

    // Handle Telegram polling errors
    bot.on("polling_error", (err) => console.log("Polling Error:", err.message));
};