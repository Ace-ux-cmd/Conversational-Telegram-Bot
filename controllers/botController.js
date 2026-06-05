// Import AI response services for private and group chats
const { getAIResponse } = require("../service/aiService");
const { aiGroupResponse } = require("../service/groupAi");
const { saveMessage } = require("../models/messagesModel");
const { updateGroupInteraction } = require("../models/groupsModel");
const { updateUserInteraction } = require("../models/userModel");
const activity = require("../utils/activity"); 


//  Calculates a proper random delay between min and max seconds inclusive

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

            aiResponse = await getAIResponse(currentUser);
        } else {
            aiResponse = await aiGroupResponse(currentUser);
        }

        // If AI produced a response, send it back
        if (aiResponse) {
            const sentMessage = await bot.sendMessage(currentUser.chatId, aiResponse, {
                reply_to_message_id: currentUser.msgId
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
                updateGroupInteraction(recipientId);
            }

            return;
        }

        // Retry logic when AI fails
        if (currentUser.retries <= 3) {
            currentUser.retries = (currentUser.retries || 0) + 1;
            return currentUser;
        }

        // Final fallback after repeated failures
        await bot.sendMessage(
            currentUser.chatId,
            `Sorry, I'm slammed rn and have no time for chats 😩🫠
                Anyways, don't bother replying, I'll be back soon.
                Keep it chill till then.`,
            {
                reply_to_message_id: currentUser.msgId
            }
        );

    } catch (err) {
        // Central failure handler for unexpected runtime issues
        console.error("processUserRequest failed:", err);

        try {
            await bot.sendMessage(
                currentUser.chatId || currentUser.userId,
               "Sorry, I'm a bit overloaded right now. Try again later."
            );
        } catch (sendErr) {
            console.error("Failed to send error message:", sendErr);
        }
    }
}

// Export handler for message pipeline
module.exports = { processUserRequest };