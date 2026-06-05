const { saveMessage } = require("../models/messagesModel");

module.exports = (bot) => {
    // File-scoped registry to hold pending expiration timeouts by message ID
    const pendingTimeouts = new Map();

    // Command Trigger
    bot.onText(/\/truthordare/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Truth 🫢", callback_data: "tod|truth_question" }],
                        [{ text: "Dare 🫣", callback_data: "tod|dare_question" }]
                    ]
                }
            };

            const menuMsg = await bot.sendMessage(chatId, "pick an option", options);

            // Clean up incoming user /truthordare execution trigger
            await bot.deleteMessage(chatId, msg.message_id).catch(() => {});

            // Set up a 15-second timer to delete the menu ONLY if no response is received
            const timerId = setTimeout(async () => {
                try {
                    await bot.deleteMessage(chatId, menuMsg.message_id);
                } catch (err) {
                    // Fails silently if message was already modified or deleted manually
                } finally {
                    pendingTimeouts.delete(menuMsg.message_id);
                }
            }, 15000);

            // Store reference to timer
            pendingTimeouts.set(menuMsg.message_id, timerId);

        } catch (err) {
            console.error("Error initiating truthordare command:", err.message);
            bot.sendMessage(chatId, "❌ Something went wrong trying to initialize the game.").catch(() => {});
        }
    });

    // Callback Handling State Machine
    bot.on("callback_query", async (query) => {
        if (!query.data) return;

        const [prefix, action] = query.data.split("|");
        // Namespace Guard: Only process callbacks originating from this module
        if (prefix !== "tod") return;

        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;

        // RESPONSE RECEIVED: Clear and strip out the expiration timer instantly
        if (pendingTimeouts.has(messageId)) {
            clearTimeout(pendingTimeouts.get(messageId));
            pendingTimeouts.delete(messageId);
        }

        try {
            switch (action) {
                case "truth_question": {
                    const api = await fetch('https://api.truthordarebot.xyz/v1/truth');
                    const data = await api.json();
                    const ques = data.question;

                    if (query.message.chat.type === 'private') {
                        // Fixed local scope: captured the result of editMessageText as 'res'
                        const res = await bot.editMessageText(ques, {
                            chat_id: chatId,
                            message_id: messageId
                        });
                        
                        // Safely pass properties to persistence database layer
                        await saveMessage(res.message_id, res.chat.id, 'model', ques).catch(err => {
                            console.error("Database save failed for truth message:", err.message);
                        });
                    } else {
                        await bot.editMessageText(`*Kindly respond to this question For follow up convo*\n\n${ques}`, {
                            chat_id: chatId,
                            message_id: messageId,
                            parse_mode: 'Markdown'
                        });
                    }
                    break;
                }

                case "dare_question": {
                    const api = await fetch('https://api.truthordarebot.xyz/v1/dare');
                    const data = await api.json();
                    const ques = data.question;

                    await bot.editMessageText(`*Here's a dare:*\n\n${ques}`, {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'Markdown'
                    });
                    break;
                }
            }

            // Acknowledge callback immediately to eliminate loading circles on the UI
            await bot.answerCallbackQuery(query.id).catch(() => {});

        } catch (err) {
            console.error("Error executing truthordare round choice:", err.message);
            bot.answerCallbackQuery(query.id, { text: "❌ Failed to fetch game questions.", show_alert: true }).catch(() => {});
        }
    });
};