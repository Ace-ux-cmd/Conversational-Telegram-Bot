/**
 * Web server setup module
 * Handles health check endpoint + keeps deployment alive via self-ping
 */
module.exports = (app) => {

    // Basic health check route to confirm GAME/server is running
    app.get("/", (req, res) => {
        res.send("GAME is running ✅");
    });

    // Base URL used for self-pinging (keeps service awake on hosting platforms like Render)
    const BOT_URL = process.env.BOT_URL;

    if (!BOT_URL) {
    console.warn("BOT_URL not set, skipping self-ping");
    return;
}
    /**
     * Self-ping mechanism:
     * Prevents the server from sleeping due to inactivity
     * Runs every 25 minutes
     */
    setInterval(async () => {
        try {

            // Send GET request to GAME URL
            await fetch(BOT_URL);

            console.log("Self-ping successful ✅");

        } catch (err) {

            // Log failures without crashing process
            console.error("Self-ping failed ❌", err);
        }

    }, 25 * 60 * 1000); // 25 minutes interval
};