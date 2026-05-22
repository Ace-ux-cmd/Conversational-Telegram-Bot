// Import AI response services for private and group chats
const { getAIResponse } = require("../service/aiService");
const { aiGroupResponse } = require("../service/groupAi");

// Holds the generated AI response for the current execution cycle
let aiResponse;

// Generates a random delay between 5s and 10s to simulate thinking time
const randomDelay = () => Math.floor(Math.random() * 6 + 5) * 1000;

/**
 * Handles processing of a user message and returns an AI-generated response
 * depending on whether the chat is private or group.
 */
async function processUserRequest(bot, currentUser) {

    const recipientId = currentUser.chatId || currentUser.userId;

    // Show Telegram "typing..." indicator to the user
    bot.sendChatAction(recipientId, "typing");

    const userText = currentUser.message;

       const isUsingKat = /\bkat\b/i.test(userText);

if (currentUser.userId != process.env.BOT_OWNER_ID && isUsingKat) {
    
    // Warn, or ignore the user here
    bot.sendMessage(recipientId, "Kat? That's reserved. Try something else 😐");
   return;
}

    // Introduce artificial delay to mimic human-like response time
    await new Promise(r => setTimeout(r, randomDelay()));

    // Route request based on chat type (private vs group)
    if (currentUser.chatType == "private") {

        aiResponse = await getAIResponse(currentUser);

    } else {
``
        aiResponse = await aiGroupResponse(currentUser);
    }

    // If AI returns a valid response, send it back to user
    if (aiResponse) {

        bot.sendMessage(currentUser.chatId, aiResponse, {
            reply_to_message_id: currentUser.msgId // Reply in thread context
        });

    } else {

        // Retry logic: allow up to 3 retries before giving fallback message
        if (currentUser.retries <= 3) {

            currentUser.retries++; // Increment retry counter

            return currentUser;

        } else {

            // Final fallback response when AI fails consistently
            bot.sendMessage(
                currentUser.chatId,
                `Sorry, I'm slammed rn and have no time for chats 😩🫠
                Anyways, don't bother replying, I'll be back soon.
                Keep it chill till then.`,
                {
                    reply_to_message_id: currentUser.msgId
                }
            );
        }
    }
}

// Export handler for external message processing pipeline
module.exports = { processUserRequest };