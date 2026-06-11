const { getRequests } = require("../models/aiRequestModel");
const { getHealth } = require("../models/botHealthModel");
const { getById, countUsers, getUsers } = require("../models/userModel");
const { getGroups, countGroups } = require("../models/groupsModel");
const { getUsage } = require("../models/dailyUsageModel");
const fs = require("fs");
const path = require("path");
const cmdDir = fs.readdirSync(path.join(__dirname));
const uptime = new Date().toLocaleString(); // Set uptime the moment the file is loaded

module.exports = (bot) => {
    // Base /ping command
    bot.onText(/\/ping/, async (msg) => {
        const chatId = msg.chat.id;
        
        try {
            const user = await getById(msg.from.id);
            
            // If the user isn't an owner, give them an interactive trap button
            if (user?.role !== "owner") {
                const opts = {
                    reply_to_message_id: msg.message_id,
                    reply_markup: {
                        inline_keyboard: [[{ text: "🛰️ Check Server Status", callback_data: "ping_alert" }]]
                    }
                };
                return bot.sendMessage(chatId, "🔒 This diagnostics command is highly restricted.", opts);
            }

            // Gather system diagnostic metrics concurrently
            const startTime = Date.now();
            const [usersCount, groupsCount, totalAiRequests, healthStatus, dailyUsage, allUsers, allGroups] = await Promise.all([
                countUsers().catch(() => 0),
                countGroups().catch(() => 0),
                getRequests().catch(() => 0),
                getHealth().catch(() => "Unknown"),
                getUsage().catch(() => []),
                getUsers().catch(() => []),
                getGroups().catch(() => [])
            ]);
            const responseTime = Date.now() - startTime;

            // 1. Format Daily AI API Usage into clean lines
            const usageLines = Array.isArray(dailyUsage) && dailyUsage.length > 0
                ? dailyUsage.map(u => `• User \`${u.user_id}\`: ${u.usage_count} ${u.request_type} reqs`).join("\n")
                : "• No usage logged today.";

            // 2. Format Users list into clean lines (Global regex strip to protect parser from malicious usernames)
            const userLines = Array.isArray(allUsers) && allUsers.length > 0
                ? allUsers.map(u => {
                    const cleanUsername = (u.username || "Anonymous").replace(/[_*`\[\]]/g, " ");
                    const cleanFirstName = (u.first_name || "Anonymous").replace(/[_*`\[\]]/g, " ");
                    return `• \`${u.id}\` - ${cleanUsername} - ${cleanFirstName}`;
                }).join("\n")
                : "• No users found.";

            // 3. Format Group list into clean lines
            const groupLines = Array.isArray(allGroups) && allGroups.length > 0
                ? allGroups.map(g => {
                    const cleanGroupName = (g.name || g.group_name || "Unknown Group").replace(/[_*`\[\]]/g, " ");
                    return `• \`${g.id}\` - ${cleanGroupName}`;
                }).join("\n")
                : "• No groups tracked.";

            // 4. Format health List into clean lines
            const localizedHealth = Array.isArray(healthStatus) && healthStatus.length > 0
                ? healthStatus.map(h => `• \`${h.checked_at}\` : ${h.response_time_ms}ms`).join("\n")
                : "• No ping tracked.";

            // 5. Format Ai request List into clean lines (Replaced single matching swaps with clean global regex sweeps)
            const requestLogs = Array.isArray(totalAiRequests) && totalAiRequests.length > 0
                ? totalAiRequests.map(h => {
                    const safeReqType = String(h.request_type || "unknown").replace(/[_*`\[\]]/g, " ");
                    const safeRes = String(h.result || "unknown").replace(/[_*`\[\]]/g, " ");
                    const safeError = String(h.error_message || "None").replace(/[_*`\[\]]/g, " ");
                    return `• \`${h.chat_type}\` : Request: ${safeReqType} - Result: ${safeRes} - Error: ${safeError}`;
                }).join("\n")
                : "• No request tracked.";

            const dashboard = 
                `📊 *SYSTEM DIAGNOSTICS PING*\n\n` +
                `⏰ **Uptime:** Since ${uptime}\n\n` +
                `🤖 **Total Commands Available:** ${cmdDir.length}\n\n` +
                `🟢 **Bot Health:**\n${localizedHealth}\n\n` +
                `👥 **Total Users:** \n${usersCount}\n\n` +
                `👤 **Users List:**\n${userLines}\n\n` +
                `🏢 **Total Groups:** ${groupsCount}\n\n` +
                `💬 **Groups List:**\n${groupLines}\n\n`+
                `📈 **Lifetime AI Requests:** \n${requestLogs}\n\n` +
                `📊 **Daily AI API Usage:**\n${usageLines}\n\n`+
                `⚡ **Response Latency:** ${responseTime}ms\n\n`  ;

            await bot.sendMessage(chatId, dashboard, { parse_mode: "Markdown" });

        } catch (err) {
            console.error("Ping diagnostics failed:", err.message);
            bot.sendMessage(chatId, "❌ Failed to complete system diagnostic metrics fetch.");
        }
    });

    // Global Callback Handler for non-owners trying to click the status button
    bot.on("callback_query", async (query) => {
        if (query.data !== "ping_alert") return;

        try {
            const user = await getById(query.from.id);

            if (user?.role !== "owner") {
                return bot.answerCallbackQuery(query.id, {
                    text: "❌ Access Denied!\nYeah, that's not something you can do. Owner only.",
                    show_alert: true
                });
            }

            await bot.answerCallbackQuery(query.id, { text: "Authorized. Fetching..." });
            const [usersCount, groupsCount] = await Promise.all([countUsers().catch(() => 0), countGroups().catch(() => 0)]);
            
            await bot.editMessageText(`📊 **Owner Authorized Overlap**\n\nUsers: ${usersCount}\nGroups: ${groupsCount}`, {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id
            });

        } catch (err) {
            console.error("Ping alert callback exception:", err.message);
            bot.answerCallbackQuery(query.id, { text: "❌ System verification error.", show_alert: true });
        }
    });
};