// MODULE FOR MESSAGE QUEUEING AND HANDLING (pipeline that connects Telegram → queue → AI engine)


const { processUserRequest } = require("./botController");
const { handleImageMessage } = require("./imageController");

// user lookup (used for role-based queue priority)
const { createOrGet, getById } = require("../models/userModel");
const { saveGroup } = require("../models/groupsModel");
const { addMember } = require("../models/groupMembersModel");

// simple in-memory queue (FIFO unless priority overrides it)
const queue = [];
let isProcessing = false;

/**
 * bot bootstrap function
 * wires message listener + queue processor
 */
module.exports = (bot) => {

    /**
     * queue runner
     * only allows one message to be processed at a time
     */
    const runQueue = async () => {
        if (isProcessing || queue.length === 0) return;

        isProcessing = true;
        const nextUser = queue.shift();

        try {
            const retryUser = await processUserRequest(bot, nextUser);

            // if AI pipeline says “try again later”, requeue it
            if (retryUser) {
                // too many failures → cool down before retrying
                if (retryUser.retries >= 2) {
                    setTimeout(() => {
                        queue.push(retryUser);
                        runQueue();
                    }, 10 * 60 * 1000);
                } else {
                    // quick retry, no cooldown
                    queue.push(retryUser);
                }
            }
        } catch (err) {
            console.error("Queue Task Error:", err);
        } finally {
            // small breathing room between messages
            setTimeout(() => {
                isProcessing = false;
                runQueue();
            }, 3000);
        }
    };

    /**
     * main telegram message handler
     * filters noise, builds request object, pushes into queue
     */
    bot.on("message", async (msg) => {
        try {
            const chatId = msg.chat.id;
            const chatType = msg.chat.type;
            const isGroup = chatType !== "private" && chatType !== "channel";
            
            let user = null;

 // If they have a username, use it. If not, generate an uncollidable unique string using their ID.
    const username = msg.from.username 
        ? msg.from.username 
        : `tg_user_${msg.from.id}`;
        
            // Handle User Lookup Based on Chat Context
            if (!isGroup) {
                // Only create/get global user records for private conversations
                user = await createOrGet(chatId, username, msg.from.first_name);
            } else {
                // For groups, look up the sender's existing profile by their actual sender ID (if it exists)
                // This prevents registering a group ID inside the user table
                user = await getById(msg.from.id);
            }
                    // Stop processing if the account is currently marked as banned
                    if (user?.status === "banned") {
                        return "yeah i'm not supposed be talking to you rn. if you think this is a mistake, type /callad and sort it out.";
                    }

            // --- MULTIMODAL PHOTOGRAPHIC INTERCEPT BLOCK ---
            if (msg.photo) {
                // Outsources evaluation, matching rules, downscaling and responses to isolation layer
                await handleImageMessage(bot, msg, user);
                return;
            }

            const userText = msg.text;

            // Simple keyword restriction for reserved term usage
            if (userText) {
                const isUsingKat = /\bkat\b/i.test(userText);
                if (user?.role === "user" && isUsingKat) {
                    await bot.sendMessage(
                        chatId,
                        "Kat? That's reserved. Try something else 😐"
                    );
                    return;
                }
            }

            // Media & Command Interceptions
            if (msg.sticker) return bot.sendMessage(chatId, "A sticker huh? Try using an emoji instead 🥲");
            if (msg.video) return bot.sendMessage(chatId, "A video? What's it about?");
            if (msg.voice) return bot.sendMessage(chatId, "Not a phone call kinda person, type it out instead 🙂");
            if (!msg.text) return;
            if (msg.text.includes("/")) return;

            const pending = {
                msgId: msg.message_id,
                chatId,
                userId: msg.from.id,
                username: msg.from.first_name,
                message: msg.text,
                chatType: chatType,
                retries: 0
            };

            // Handle Group Specific Pipelines
            if (isGroup) {
                if (msg.from.is_bot) return;

                const chatAdmin = await bot.getChatAdministrators(chatId);
                const groupOwner = chatAdmin.find(n => n.status === "creator");
                
                if (groupOwner) {
                    await saveGroup(chatId, msg.chat.title, chatType, groupOwner.user.id);
                }
                
                const reply = msg.reply_to_message;
                const text = msg.text.toLowerCase();
                const botTag = "@kathill";

                // Map specific user membership data to the separate group management schema
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

            // Prioritize Queue Insertion
            if (user?.role === "owner" || user?.role === "admin") {
                queue.unshift(pending);
            } else {
                queue.push(pending);
            }

            runQueue();

        } catch (err) {
            console.error("Message handler crashed:", err);
            try {
                await bot.sendMessage(msg.chat.id, "Sorry, couldn't process that message correctly.");
            } catch (_) {
                // ignore secondary failure
            }
        }
    });

    // Handle Telegram polling errors
    bot.on("polling_error", (err) => console.log("Polling Error:", err.message));
};