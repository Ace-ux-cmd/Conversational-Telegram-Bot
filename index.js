require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling: true});
const express = require("express");
const app = express();
const fs = require("fs");

require("./controllers/messageHandler")(bot)
require("./utils/ping")(app)

// Listen for commands
fs.readdirSync("./cmd").forEach((file)=>{
if (file.endsWith(".js")) require(`./cmd/${file}`) (bot)
});