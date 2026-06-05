const { getById, getUsers } = require("../models/userModel");

module.exports = (bot) => {
    // Listen for the global broadcast "/notify" command
    bot.onText(/\/notify/, async (msg) => {
        const chatId = msg.chat.id;
        const senderId = msg.from.id;

        try {
            // Retrieve requesting user profile credentials from the database layer
            const user = await getById(senderId);

            // Restrict operations strictly to owners and admins
            if (user?.role !== 'owner' && user?.role !== 'admin') {
                await bot.sendMessage(chatId, "yeah that's not something you can do. admins only.", {
                    reply_to_message_id: msg.message_id
                });
                return;
            }

            // Extract trailing query notification content string payload 
            const [cmd, ...query] = msg.text?.trim().split(/\s+/) || [];
            const broadcastMessage = query.join(" ");

            // Ensure notification content string payload is not empty
            if (!broadcastMessage) {
                await bot.sendMessage(chatId, "*Invalid Format, use /help to view usage*", {
                    reply_to_message_id: msg.message_id,
                    parse_mode: 'Markdown'
                });
                return;
            } 

            // Safe array initialization guard fallback to avoid mapping across undefined objects
            const rawUsersData = await getUsers().catch(() => []);
            const users = Array.isArray(rawUsersData) ? rawUsersData : [];
            const recipients = users.map(u => u.id);

            // Metric tracking variables to report back summary diagnostics neatly to admin
            let successCount = 0;
            let failureCount = 0;

            // Sequentially loop recipients applying artificial throttle padding to honor Telegram rate caps
            for (let targetUid of recipients) {
                try {
                    // Do not deliver broadcast to the admin who initiated the trigger command
                    if (Number(targetUid) === Number(senderId)) continue;
                    
                    // Controlled delay interval step prevents throwing 429 flood errors
                    await new Promise(resolve => setTimeout(resolve, 100));

                    await bot.sendMessage(targetUid, `*📢 Okay so. My admin wanted you to know this:*\n\n${broadcastMessage}`, {
                        parse_mode: "Markdown"
                    });
                    
                    successCount++;

                } catch (deliveryErr) {
                    // Silently increment failures during runtime so spam notifications do not overload admin inbox
                    console.error(`Broadcast transmission failed for target UID ${targetUid}:`, deliveryErr.message);
                    failureCount++;
                }
            }

            // Deliver a singular clean execution metrics report back to administrative user chat
            const summaryReport = `*sent it 😊✓*\n\n📊 *Broadcast Summary:*\n• Delivered: ${successCount}\n• Failed/Blocked: ${failureCount}`;
            const confirmation = await bot.sendMessage(chatId, summaryReport, { parse_mode: "Markdown" });
            
            // Establish an isolated 5-second auto-cleanup lifecycle hook
            setTimeout(async () => {
                try {
                    await bot.deleteMessage(chatId, confirmation.message_id).catch(() => {});
                } catch (timeoutErr) {
                    console.error("Broadcast confirmation cleanup failed:", timeoutErr.message);
                }
            }, 5000);
        
        } catch (err) {
            console.error("Critical routing error inside /notify execution handler:", err.message);
            await bot.sendMessage(chatId, "❌ System failure occurred while attempting notification delivery matrix execution.").catch(() => {});
        }
    });
};