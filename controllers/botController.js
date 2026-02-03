const { getAIResponse } = require("../service/aiService");
const { aiGroupResponse } = require("../service/groupAi");

let aiResponse;
const randomDelay = () => Math.floor(Math.random() * 6 + 5) * 1000;

async function processUserRequest(bot, currentUser) {
    //  Show typing status
    bot.sendChatAction(currentUser.userId, "typing");

    //  Artificial delay before invoking AI (5s - 10s)
    await new Promise(r => setTimeout(r, randomDelay()));

    // Get AI content for private
    if (currentUser.chatType == "private") aiResponse = await getAIResponse(currentUser);
    else aiResponse = await aiGroupResponse(currentUser)
    // Send response to user
    if (aiResponse) {
        bot.sendMessage(currentUser.chatId, aiResponse, { 
            reply_to_message_id: currentUser.msgId 
        });
    } else {
        bot.sendMessage(currentUser.chatId, `Sorry, i’m slammed with work and school and have no time left for chats this month😩🫩. Anyways, don’t bother replying to this, i’ll be back at the start of next month.
        If not, message my admin. Keep it chill till then 
  
PS:  
This is just an automated message btw`, { 
            reply_to_message_id: currentUser.msgId 
        });
    }
}

module.exports = { processUserRequest };
