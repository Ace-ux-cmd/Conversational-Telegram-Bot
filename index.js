// ENTRY MODULE


// Load environment variables from .env file
require("dotenv").config();

// Initialize Telegram bot with polling enabled
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_API_KEY, { polling: true });

// Initialize Express server instance
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Node-cron for scheduling
const cron = require("node-cron");

// Load migrations
const runMigration = require("./migrations");

// File system module used for dynamic command loading
const fs = require("fs");

// Register main message handler (core bot logic)
require("./controllers/messageHandler")(bot);
require("./controllers/groupController")(bot);

// Utils
require("./utils/ping")(app, bot);

// Require models for schedule
const { resetDaily } = require("./models/dailyUsageModel");
const { deleteInactive } = require("./models/userModel")


// * Dynamic command loader: Reads all files inside /cmd directory and registers them as bot commands
fs.readdirSync("./cmd").forEach((file) => {

    // Only load JavaScript command files
    if (file.endsWith(".js")) {
        require(`./cmd/${file}`)(bot);
    }
});

cron.schedule("0 0 * * *", async()=>{
try{
    await Promise.all([resetDaily(), deleteInactive()])
}catch(e){
    console.log("Error In schedule task: ", e.message);
}
});

//Start server
app.listen(PORT, async()=>{
    await runMigration();
    console.log(`Bot running on port ${PORT}`)
});
