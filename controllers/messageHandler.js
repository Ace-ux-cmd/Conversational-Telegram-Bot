// MODULE FOR MESSAGE QUEUEING AND HANDLING (pipeline that connects Telegram → queue → AI engine)


const { processUserRequest } = require("./botController");
const { createOrGet, getById } = require("../models/userModel");
const { saveGroup } = require("../models/groupsModel");
const { addMember } = require("../models/groupMembersModel");

const queue = [];
let isProcessing = false;

module.exports = (bot) => {

    const runQueue = async () => {
        if (isProcessing || queue.length === 0) return;

        isProcessing = true;
        const nextUser = queue.shift();

        try {
            const retryUser = await processUserRequest(bot, nextUser);

            if (retryUser) {
                if (retryUser.retries >= 2) {
                    setTimeout(() => {
                        queue.push(retryUser);
                        runQueue();
                    }, 10 * 60 * 1000);
                } else {
                    queue.push(retryUser);
                }
            }
        } catch (err) {
            console.error("Queue Task Error:", err);
        } finally {
            setTimeout(() => {
                isProcessing = false;
                runQueue();
            }, 5000);
        }
    };

    bot.on("message", async (msg) => {
        try {
            const chatId = msg.chat.id;
            const chatType = msg.chat.type;
            const isGroup = chatType !== "private" && chatType !== "channel";
            
            let user = null;
            const username = msg.from.username ? msg.from.username : `tg_user_${msg.from.id}`;
                
            if (!isGroup) {
                user = await createOrGet(chatId, username, msg.from.first_name);
            } else {
                user = await getById(msg.from.id);
            }
            
            if (user?.status === "banned") {
                return bot.sendMessage(chatId, "yeah i'm not supposed be talking to you rn. if you think this is a mistake, type /callad and sort it out.");
            }

            const userText = msg.text || msg.caption || "";

            if (userText) {
                const isUsingKat = /\bkat\b/i.test(userText);
                if (user?.role === "user" && isUsingKat) {
                    await bot.sendMessage(chatId, "Kat? That's reserved. Try something else 😐");
                    return;
                }
            }

            if (msg.sticker) return bot.sendMessage(chatId, "A sticker huh? Try using an emoji instead 🥲");
            if (msg.video) return bot.sendMessage(chatId, "A video? What's it about?");
            
            // Intercept voice state tags but allow execution loop processing down the pipeline line
            if (msg.voice && chatType !== "private") {
                return bot.sendMessage(chatId, "Not a phone call kinda person, type it out instead 🙂");
            }
            
            // Consolidated evaluation condition to support voice and photo streams alongside standard text strings
            if (!msg.text && !msg.photo && !msg.voice) return;
            if (msg.text && msg.text.includes("/")) return;

            const pending = {
                msgId: msg.message_id,
                chatId,
                userId: msg.from.id,
                username: msg.from.first_name,
                message: userText,
                chatType: chatType,
                retries: 0,
                photo: msg.photo || null,
                isVoiceMessage: !!msg.voice,          // Boolean state flag check
                voiceFileId: msg.voice?.file_id || null, // Tracking identification pointer
                hasTranscribed: false,
                rawMsg: msg, 
                user: user   
            };

            if (isGroup) {
                if (msg.from.is_bot) return;

                const chatAdmin = await bot.getChatAdministrators(chatId);
                const groupOwner = chatAdmin.find(n => n.status === "creator");
                
                if (groupOwner) {
                    await saveGroup(chatId, msg.chat.title, chatType, groupOwner.user.id);
                }
                
                const reply = msg.reply_to_message;
                const text = userText.toLowerCase();
                const botTag = "@kathill";

                const { status } = await bot.getChatMember(chatId, msg.from.id);
                await addMember(chatId, msg.from.id, status, msg.from.first_name);

                if (reply && reply.from?.username === "kathill_bot") {
                    pending.botName = "kathill";
                    pending.replied_message = reply.text || reply.caption || "";
                } else if (
                    !text.includes("katelyn") &&
                    !text.includes(botTag) &&
                    !text.includes("kat")
                ) {
                    return;
                }
            }

            if (user?.role === "owner" || user?.role === "admin") {
                queue.unshift(pending);
            } else {
                queue.push(pending);
            }

            runQueue();

        } catch (err) {
            console.error("Message handler crashed:", err);
            try {
                await bot.sendMessage(msg.chat.id, "Sorry, my head's aching, couldn't process that message correctly.");
            } catch (_) {}
        }
    });

    bot.on("polling_error", (err) => console.log("Polling Error:", err.message));
};