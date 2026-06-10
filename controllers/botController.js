// MODULE FOR BOT REPLY HANDLING


// Import AI response services for private and group chats
const { getAIResponse } = require("../service/aiService");
const { aiGroupResponse } = require("../service/groupAi");
const { saveMessage } = require("../models/messagesModel");
const { updateGroupInteraction } = require("../models/groupsModel");
const { updateUserInteraction } = require("../models/userModel");
const { trackFailedMessage } = require("../utils/rateLimitTracker");
const fallbackConfig = require("../config/fallback.json");
const activity = require("../utils/activity"); 

// Calculates a proper random delay between min and max seconds inclusive
const getRandomDelay = () => {
    let min;
    let max;

    // Evaluates the schedule in real-time, every single text
    const scheduleContext = activity();

    if (scheduleContext.includes("You are currently at work at the coffee shop")) {
        // Shift hours: significantly slower responses (e.g., 10 to 15 seconds)
        min = 10; 
        max = 15;
    } else {
        // Free time: normal responsive texting (e.g., 3 to 10 seconds)
        min = 3;
        max = 10;
    }

    // Formula for inclusive random range: Math.random() * (max - min + 1) + min
    const seconds = Math.floor(Math.random() * (max - min + 1)) + min;
    return seconds * 1000;
};

/**
 * Main message handler.
 * Routes messages to the correct AI flow depending on chat type,
 * handles bans, retries, and response persistence.
 */
async function processUserRequest(bot, currentUser) {
    let aiResponse;

    try {
        const recipientId = currentUser.chatId || currentUser.userId;

        // Show Telegram typing indicator
        await bot.sendChatAction(recipientId, "typing");

        // Dynamic delay evaluated per message based on current time
        const currentDelay = getRandomDelay();
        await new Promise((resolve) => setTimeout(resolve, currentDelay));

        // Decide AI flow based on chat type
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

        // Intercept structured error signatures coming from the AI generation engines
       if (aiResponse && aiResponse.success === false) {
            currentUser.retries = (currentUser.retries || 0) + 1;

            // GATE A: Return context straight back to runQueue for immediate rotation or 10-min retry hold
            if (currentUser.retries <= 2) {
                return currentUser;
            }

            // GATE B: The 10-minute retry attempt has failed. Escalating to 1-Hour Roommate Map.
            let selectionPool = fallbackConfig.roommateReplies.serviceDown;
            if (aiResponse.errorType === "429") {
                selectionPool = fallbackConfig.roommateReplies.rateLimited;
            }

            // Dynamically select a random roommate excuse from the config pool
            const dynamicReply = selectionPool[Math.floor(Math.random() * selectionPool.length)];

            // Register the context into the 1-hour map tracking layer
            trackFailedMessage(currentUser.userId, bot, currentUser);

            // Deliver the roommate response directly through her phone stream
            await bot.sendMessage(currentUser.chatId, dynamicReply, {
                reply_to_message_id: currentUser.msgId
            }).catch((e) => console.error("Failed to deliver roommate fallback notice:", e.message));

            return null;
        }

        // If AI produced a valid textual response, process delivery and logging
        if (aiResponse && typeof aiResponse === "string") {
            const sentMessage = await bot.sendMessage(currentUser.chatId, aiResponse, {
                reply_to_message_id: currentUser.msgId,
                parse_mode: 'Markdown'
            });

            // Persist bot response only in private chats
            if (currentUser.chatType === "private") {
                await saveMessage(
                    sentMessage.message_id,
                    currentUser.userId,
                    "model",
                    aiResponse,
                    currentUser.msgId
                );
                await updateUserInteraction(currentUser.userId);
            } else {
               await updateGroupInteraction(recipientId);
            }

            return null;
        }

    } catch (err) {
        console.error("Central processing pipeline critical failure:", err);
        
        try {
            if (currentUser.retries > 2) {
                
                // Safeguard randomized selection for unexpected structural engine drops
                const emergencyPool = fallbackConfig.roommateReplies.serviceDown;
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

// Export handler for message pipeline
module.exports = { processUserRequest };