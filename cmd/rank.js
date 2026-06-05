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
      const message = `🏆 <b>LEADERBOARD</b> 🏆

<pre>
POS ID          USERNAME        FIRSTNAME       SCORE
-----------------------------------------------------
${leaderboard || "No data available in leaderboard yet."}
</pre>

Your position: <b>${displayPosition}</b>`;

      await bot.sendMessage(chatId, message, {
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id,
      });

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