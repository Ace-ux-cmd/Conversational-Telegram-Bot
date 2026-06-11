const { getLeaderboard } = require("../models/leaderboardModel");

module.exports = (bot) => {
  bot.onText(/\/rank/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const userCount = await getLeaderboard();
      // Safe fallback step ensuring we map over a valid array structure
      const leaderboardData = Array.isArray(userCount) ? userCount : [];

      const leaderboard = leaderboardData
        .map((user, index) => {
          const pos = String(index + 1).padEnd(4);
          const uid = String(user.user_id).padEnd(12);
          const uname = String(user.username || "N/A").padEnd(16);
          const fname = String(user.first_name || "N/A").padEnd(16);
          const score = String(user.score || 0);

          return `${pos}${uid}${uname}${fname}${score}`;
        })
        .join("\n");

      const position = leaderboardData.findIndex(
        (user) => Number(user.user_id) === Number(msg.from.id)
      );

      const displayPosition = position !== -1 ? position + 1 : "Not ranked";

      // HTML preformatted string template with structural padding layout columns aligned
      const message = `🏆 <b>LEADERBOARD</b> 🏆\n\n<pre>\nPOS ID          USERNAME        FIRSTNAME       SCORE\n-----------------------------------------------------\n${leaderboard || "No data available in leaderboard yet."}\n</pre>\n\nYour position: <b>${displayPosition}</b>\n\n<i>⏳ This message will self-destruct in 30 seconds.</i>`;

      // 1. Capture the sent message payload object
      const sentMessage = await bot.sendMessage(chatId, message, {
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id,
      });

      // 2. Set the 30-second execution countdown worker
      setTimeout(async () => {
        try {
          await bot.deleteMessage(chatId, sentMessage.message_id);
        } catch (deleteErr) {
          // Gracefully handle scenarios where users delete it manually first
          console.log(`Auto-delete skipped: Message already removed or missing permission.`);
        }
      }, 30 * 1000);

    } catch (err) {
      console.error("Error in rank command:", err.message);
      
      await bot.sendMessage(
        chatId,
        "couldn't load the leaderboard right now. Please try again later or contact an admin with /callad",
        { reply_to_message_id: msg.message_id }
      ).catch(() => {});
    }
  });
};