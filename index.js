// Load environment variables from .env file
require("dotenv").config();

// Initialize Telegram bot with polling enabled
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_API_KEY, { polling: true });

// Initialize Express server instance
const express = require("express");
const app = express();

// File system module used for dynamic command loading
const fs = require("fs");

// Register main message handler (core bot logic)
require("./controllers/messageHandler")(bot);

// Register ping/keep-alive web server logic
require("./utils/ping")(app);

/**
 * Dynamic command loader:
 * Reads all files inside /cmd directory and registers them as bot commands
 */
fs.readdirSync("./cmd").forEach((file) => {

    // Only load JavaScript command files
    if (file.endsWith(".js")) {
        require(`./cmd/${file}`)(bot);
    }
});