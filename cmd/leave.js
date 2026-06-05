const { getById } = require("../models/userModel");
const { getGroups } = require("../models/groupsModel");

module.exports = (bot) => {
  // Listen for the "/leave" command with optional group ID arguments
  bot.onText(/\/leave(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      // Retrieve requesting user profile credentials from the database layer
      const user = await getById(userId);

      //Restrict operations strictly to system owner
      if (user?.role !== "owner") {
        const confirmation = await bot.sendMessage(
          chatId,
          "yeah that's not something you can do. owner only",
          { reply_to_message_id: msg.message_id }
        );

        // Isolated timer context to prevent runtime crashes during racing message deletions
        setTimeout(async () => {
          try {
            await Promise.all([
              bot.deleteMessage(chatId, confirmation.message_id).catch(() => {}),
              bot.deleteMessage(chatId, msg.message_id).catch(() => {})
            ]);
          } catch (timeoutErr) {
            console.error("Leave command restriction cleanup failed:", timeoutErr.message);
          }
        }, 5000);

        return;
      }

      const query = match?.[1]?.trim();

      //  /leave (no arguments provided) -> leave all tracked groups concurrently
      if (!query) {
        // Safe array initialization guard fallback to avoid mapping across undefined objects
        const groupsData = await getGroups().catch(() => []);
        const groups = Array.isArray(groupsData) ? groupsData : [];

        if (groups.length === 0) {
          await bot.sendMessage(chatId, "there are no active groups logged in the system records.");
          return;
        }

        // Settled state resolution array avoids dropping the chain if a single chat kicked the bot out early
        await Promise.allSettled(
          groups.map((group) => bot.leaveChat(group.id).catch(() => {}))
        );

        await bot.sendMessage(chatId, "successfully departed all registered group chats.");
        return;
      }

      // /leave <groupId> -> leave specific target chat identifier directly
      const groupId = query;

      await bot.leaveChat(groupId);
      await bot.sendMessage(chatId, `successfully left group: \`${groupId}\``, { parse_mode: "Markdown" });

    } catch (err) {
      console.error("Critical routing error inside /leave execution handler:", err.message);
      
      // Defensively route failure message to available conversational thread origin window
      const fallbackTarget = chatId || userId;
      if (fallbackTarget) {
        await bot.sendMessage(
          fallbackTarget, 
          `an error occurred while attempting to process the chat departure sequence: ${err.message}`
        ).catch(() => {});
      }
    }
  });
};