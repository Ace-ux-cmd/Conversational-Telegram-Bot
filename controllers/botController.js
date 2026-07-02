// MODULE FOR ROUTING INCOMING MESSAGES


const { getAIResponse } = require("../service/aiService");
const { aiGroupResponse } = require("../service/groupAi");
const { handleImageMessage } = require("./imageController");
const { handleIncomingVoice } = require("./voiceController");
const { saveMessage } = require("../models/messagesModel");
const { updateGroupInteraction } = require("../models/groupsModel");
const { updateUserInteraction } = require("../models/userModel");
const { rateLimited, serviceDown } = require("../config/fallback.js");
const { trackFailedMessage } = require("../utils/rateLimitQueue");
const activity = require("../utils/activity"); 

const getRandomDelay = () => {
    let min;
    let max;
    const scheduleContext = activity();

    if (scheduleContext.includes("You are currently at work at the coffee shop")) {
        min = 10; 
        max = 15;
    } else {
        min = 3;
        max = 10;
    }

    const seconds = Math.floor(Math.random() * (max - min + 1)) + min;
    return seconds * 1000;
};

async function processUserRequest(bot, currentUser) {
    let aiResponse;

    try {
        const recipientId = currentUser.chatId || currentUser.userId;


        // Show Telegram typing indicator
        
            await bot.sendChatAction(recipientId, "typing");
        

        const currentDelay = getRandomDelay();
        await new Promise((resolve) => setTimeout(resolve, currentDelay));

        
        // INGESTION ROUTER: If the message payload is an incoming voice note, divert to processing controller
        if (currentUser.isVoiceMessage && !currentUser.hasTranscribed) {
            currentUser.hasTranscribed = true;
            
            // Extract the active key for transcription beforehand 
            const getRandomKey = require("../utils/keyRotation");
            currentUser.assignedKey = await getRandomKey();
            
            handleIncomingVoice(bot, currentUser, currentUser.voiceFileId, processUserRequest);
            return null; // Unblock the FIFO message queue immediately
        }

        if (currentUser.photo) {
            await handleImageMessage(bot, currentUser.rawMsg, currentUser.user);
            return null;
        }

        if (currentUser.chatType === "private") {
            
                await saveMessage(
                    currentUser.msgId,
                    currentUser.userId,
                    "user",
                    currentUser.message
                );
                
            aiResponse = await getAIResponse(currentUser, bot);
        } else {
            aiResponse = await aiGroupResponse(currentUser);
        }

        if (aiResponse && aiResponse.success === false) {
            currentUser.retries = (currentUser.retries || 0) + 1;

            if (currentUser.retries <= 2) {
                return currentUser;
            }

            let selectionPool = serviceDown;
            if (aiResponse.errorType === "429") {
                selectionPool = rateLimited;
            }

            const dynamicReply = selectionPool[Math.floor(Math.random() * selectionPool.length)];
            trackFailedMessage(currentUser.userId, bot, currentUser);

            await bot.sendMessage(currentUser.chatId, dynamicReply, {
                reply_to_message_id: currentUser.msgId
            }).catch((e) => console.error("Failed to deliver roommate fallback notice:", e.message));

            return null;
        }

    // GENERATION ROUTER TYPE A: Process Multi-Modal Voice Output Response
        if (aiResponse && aiResponse.type === "voice") {
            
            // Attach file-meta context configurations directly to the buffer to unblock the node-telegram API
            const sentVoice = await bot.sendVoice(currentUser.chatId, aiResponse.payload, {
                reply_to_message_id: currentUser.msgId
            }, {
                filename: 'voice.ogg',
                contentType: 'audio/ogg'
            });

            if (currentUser.chatType === "private") {
                await saveMessage(
                    sentVoice.message_id,
                    currentUser.userId,
                    "model",
                    aiResponse.transcript,
                    currentUser.msgId
                );
                await updateUserInteraction(currentUser.userId);
            } else {
                updateGroupInteraction(recipientId);
            }

            return null;
        }

        // GENERATION ROUTER TYPE B: Process Standard Text Response Flow
        if (aiResponse && typeof aiResponse === "string") {
            const sentMessage = await bot.sendMessage(currentUser.chatId, aiResponse, {
                reply_to_message_id: currentUser.msgId,
                parse_mode: 'Markdown'
            });

            if (currentUser.chatType === "private") {
                await saveMessage(
                    currentUser.msgId,
                    currentUser.userId,
                    "user",
                    currentUser.message
                );
                
                await saveMessage(
                    sentMessage.message_id,
                    currentUser.userId,
                    "model",
                    aiResponse,
                    currentUser.msgId
                );
                await updateUserInteraction(currentUser.userId);
            } else {
                updateGroupInteraction(recipientId);
            }

            return null;
        }

    } catch (err) {
        console.error("Central processing pipeline critical failure:", err);
        
        try {
            if (currentUser.retries > 2) {
                const emergencyPool = serviceDown;
                const dynamicFallback = emergencyPool[Math.floor(Math.random() * emergencyPool.length)];
                
                trackFailedMessage(currentUser.userId, bot, currentUser);
                await bot.sendMessage(currentUser.chatId, dynamicFallback, { reply_to_message_id: currentUser.msgId });
                return null;
            }
            currentUser.retries = (currentUser.retries || 0) + 1;
            return currentUser;
        } catch (sendErr) {
            console.error("Failed executing automated crash defense fallback:", sendErr);
            return null;
        }
    }
}

module.exports = { processUserRequest };