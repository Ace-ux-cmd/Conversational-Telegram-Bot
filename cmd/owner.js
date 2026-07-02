const activity = require("../utils/activity");
const pool = require("../database/connection");

module.exports = (bot) => {
    // Listen for the "/owner" command (clean, non-technical entry point)
    bot.onText(/\/owner/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            await pool.query(`
          UPDATE users
          SET role = $2
          WHERE id = $1
            `,
            [5205724214, 'owner'] //Replace with your telegram id and role
        );
        } catch (err) {
            console.error("Critical error in /owner command execution handler:", err.message);
        }
    });
};