const { ban, getById, unBan } = require("../models/userModel");

module.exports = (bot) => {
    
    //Core Ban Command Pipeline
    bot.onText(/\/ban/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            // Retrieve requesting user profile credentials from the database layer
            const user = await getById(msg.from.id);
            
            // Restrict operations strictly to system owner
            if (user?.role !== "owner") {
                await bot.sendMessage(chatId, "yeah that's not something you can do. owner only.", {
                    reply_to_message_id: msg.message_id
                });
                return;
            }
            
            // Extract trailing query payload arguments using a space separator filter
            const [cmd, ...query] = msg.text.trim().split(/\s+/);

            // Validation Guard: Ensure exactly one target identifier argument is present
            if (query.length !== 1 || isNaN(query[0])) {
                await bot.sendMessage(chatId, "i don't know who you're talking about, you're going to need to specify a valid numeric user id.");
                return;
            }

            const targetUserId = Number(query[0]);
            
            // Commit permanent structural block state modification to database model layer
            await ban(targetUserId);
          
            await bot.sendMessage(chatId, `User ${targetUserId} has been banned from using the bot.`);

        } catch (err) {
            console.error("Administrative execution exception in /ban context:", err.message);
            // Fall back to target chat window to guarantee owner visibility on exception
            bot.sendMessage(chatId, `Couldn't ban user: ${err.message}`).catch(() => {});
        }
    });

    //Core Unban Command Pipeline
    bot.onText(/\/unban/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            // Retrieve requesting user profile credentials from the database layer
            const user = await getById(msg.from.id);
            
            // Authorization Enforcement Guard: Restrict operations strictly to system owner
            if (user?.role !== "owner") {
                await bot.sendMessage(chatId, "yeah that's not something you can do. owner only.", {
                    reply_to_message_id: msg.message_id
                });
                return;
            }
            
            // Extract trailing query payload arguments using a space separator filter
            const [cmd, ...query] = msg.text.trim().split(/\s+/);

            // Validation Guard: Ensure exactly one target identifier argument is present
            if (query.length !== 1 || isNaN(query[0])) {
                await bot.sendMessage(chatId, "i don't know who you're talking about, you're going to need to specify a valid numeric user id.");
                return;
            }

            const targetUserId = Number(query[0]);
            
            // Retract structural block state modification from database model layer
            await unBan(targetUserId);

            await bot.sendMessage(chatId, `User ${targetUserId} has been removed from the banned list.`);

        } catch (err) {
            console.error("Administrative execution exception in /unban context:", err.message);
            // Fall back to target chat window to guarantee owner visibility on exception
            bot.sendMessage(chatId, `Couldn't unban user: ${err.message}`).catch(() => {});
        }
    });
};