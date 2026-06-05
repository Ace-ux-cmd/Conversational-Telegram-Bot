const { upsertUserScore } = require("../models/leaderboardModel");
const { saveUsage, getCount } = require("../models/dailyUsageModel");

module.exports = (bot) => {
    
    // Listen for the "/daily" claim command
    bot.onText(/\/daily/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        // Prefer username if available to match other models smoothly
        const username = msg.from.username || msg.from.first_name || "Anonymous";

        try {
            // Check usage database records for an active daily token record
            const count = await getCount(userId, 'daily');

            //User has already claimed their points today
            if (count) {
                const confirmation = await bot.sendMessage(chatId, "you already got your points today, come back tomorrow", {
                    reply_to_message_id: msg.message_id
                });

                // Isolated timer context to prevent runtime crashes during racing message deletions
                setTimeout(async () => {
                    try {
                        await Promise.all([
                            bot.deleteMessage(chatId, confirmation.message_id).catch(() => {}),
                            bot.deleteMessage(chatId, msg.message_id).catch(() => {})
                        ]);
                    } catch (timeoutErr) {
                        console.error("Daily restriction cleanup failed:", timeoutErr.message);
                    }
                }, 5000);
        
                return;
            }
            
            // Calculate randomized points matrix allocation
            let points = Math.round((Math.floor(Math.random() * 20) + 1) / 4);
            
            // Commit structural updates to database layers concurrently
            await Promise.all([
                upsertUserScore(userId, username, points),
                saveUsage(userId, "daily")
            ]);

            const successMsg = await bot.sendMessage(chatId, `🎁 daily reward claimed! you received ${points} points`, {
                reply_to_message_id: msg.message_id
            });
       
            // Isolated success layout cleanup lifecycle hook
            setTimeout(async () => {
                try {
                    await Promise.all([
                        bot.deleteMessage(chatId, successMsg.message_id).catch(() => {}),
                        bot.deleteMessage(chatId, msg.message_id).catch(() => {})
                    ]);
                } catch (timeoutErr) {
                    console.error("Daily success cleanup failed:", timeoutErr.message);
                }
            }, 5000);
        
        } catch (err) {
            console.error("Critical error in daily.js handler context:", err.message);

            // Fail safely with contextual instructions
            await bot.sendMessage(
                chatId,
                `something went wrong with your reward, try again later 😵‍💫 hit the command again or keep doing your thing.\n` +
                `if it keeps happening, /callad gets you to an admin`, 
                { reply_to_message_id: msg.message_id }
            ).catch(() => {});
        }
    });
};