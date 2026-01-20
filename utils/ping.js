const fetch = require("node-fetch"); 

module.exports = (app) => {
    
    // Endpoint to respond to pings
app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

// Start server on Render's PORT or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// Self-ping every 25 minutes to keep Render awake
const BOT_URL = process.env.BOT_URL;

setInterval(async () => {
  try {
    await fetch(BOT_URL);
    console.log("Self-ping successful ✅");
  } catch (err) {
    console.error("Self-ping failed ❌", err);
  }
}, 25 * 60 * 1000); // 25 minutes
}