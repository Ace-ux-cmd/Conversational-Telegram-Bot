const { getById, updateRole } = require("../models/userModel");

module.exports = (bot) => {
    // Listen for the "/update <userId> <role>" administrative configuration command
    bot.onText(/\/update/, async (msg) => {
        const chatId = msg.chat.id;
        const senderId = msg.from.id;

        try {
            // Retrieve requesting user profile credentials from the database layer
            const user = await getById(senderId);

            //Restrict operations strictly to owners and admins
            if (user?.role !== 'owner' && user?.role !== 'admin') {
                await bot.sendMessage(chatId, "yeah that's not something you can do. admins only.", {
                    reply_to_message_id: msg.message_id
                });
                return;
            }

            // Parse exactly three positional parameters from command context payload
            const [cmd, targetIdRaw, targetRole] = msg.text.trim().split(/\s+/);

            // Validation Guard: Ensure both targeted arguments exist and target ID is numeric
            if (!targetIdRaw || !targetRole || isNaN(targetIdRaw)) {
                await bot.sendMessage(chatId, "i don't know who you're talking about, you're going to need to specify a valid user id and a role name.");
                return;
            }

            const targetUserId = Number(targetIdRaw);

            // Commit permanent role modification state change to database model layer
            await updateRole(targetUserId, targetRole);

            // Success Message back to the active execution window channel
            const adminConfirmation = await bot.sendMessage(
                chatId, 
                `User \`${targetUserId}\` has been updated into role: \`${targetRole}\``, 
                { parse_mode: "Markdown" }
            );

            // Direct message alert delivered to target user informing them of status change
            const directNotification = await bot.sendMessage(
                targetUserId, 
                `📢 *System Notification:*\nYour access profile status has been updated. New Role: \`${targetRole}\``, 
                { parse_mode: "Markdown" }
            ).catch((directNotifyErr) => {
                // Silently trap and log if the target user hasn't opened an active chat session with the bot
                console.warn(`Could not deliver private alert message directly to user UID ${targetUserId}:`, directNotifyErr.message);
            });

            // Establish isolated 10-second auto-cleanup lifecycle hook for active updates
            setTimeout(async () => {
                try {
                    await Promise.all([
                        bot.deleteMessage(chatId, adminConfirmation.message_id).catch(() => {}),
                        bot.deleteMessage(chatId, msg.message_id).catch(() => {})
                    ]);
                    
                    // Clear out user notification tracking copy safely if it was initialized successfully
                    if (directNotification) {
                        await bot.deleteMessage(targetUserId, directNotification.message_id).catch(() => {});
                    }
                } catch (timeoutErr) {
                    console.error("Administrative update message cleanup failed:", timeoutErr.message);
                }
            }, 10000);

        } catch (err) {
            console.error("Critical routing error inside /update execution handler:", err.message);
            // Fall back safely to trigger channel window to guarantee admin visibility on execution failure
            bot.sendMessage(chatId, `Couldn't update user: ${err.message}`).catch(() => {});
        }
    });
};