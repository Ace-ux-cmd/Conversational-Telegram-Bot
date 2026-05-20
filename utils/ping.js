// Import fetch for making HTTP requests (used for self-ping)
const fetch = require("node-fetch");

/**
 * Web server setup module
 * Handles health check endpoint + keeps deployment alive via self-ping
 */
module.exports = (app) => {

    // Basic health check route to confirm bot/server is running
    app.get("/", (req, res) => {
        res.send("Bot is running ✅");
    });

    // Determine server port (Render uses dynamic PORT)
    const PORT = process.env.PORT || 3000;

    // Start HTTP server
    app.listen(PORT, () => {
        console.log(`Web server running on port ${PORT}`);
    });

    // Base URL used for self-pinging (keeps service awake on hosting platforms like Render)
    const BOT_URL = process.env.BOT_URL;

    /**
     * Self-ping mechanism:
     * Prevents the server from sleeping due to inactivity
     * Runs every 25 minutes
     */
    setInterval(async () => {
        try {

            // Send GET request to bot URL
            await fetch(BOT_URL);

            console.log("Self-ping successful ✅");

        } catch (err) {

            // Log failures without crashing process
            console.error("Self-ping failed ❌", err);
        }

    }, 25 * 60 * 1000); // 25 minutes interval
};