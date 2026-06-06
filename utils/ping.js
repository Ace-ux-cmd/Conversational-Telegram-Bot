// Import saveHealth to store ping and db response time
const { saveHealth } = require("../models/botHealthModel");
const { getUsers } = require("../models/userModel");
const pool = require("../database/connection");

/**
 * Web server setup module
 * Handles health check endpoint + keeps deployment alive via self-ping
 */
module.exports = (app, bot) => { // Added bot instance injection parameter

    // Basic health check route to confirm GAME/server is running
    app.get("/", (req, res) => {
        res.send("Bot is running ✅");
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
     * Runs every 10 minutes
     */
    setInterval(async () => {
        try {
            // Send GET request to GAME URL
            await fetch(BOT_URL);

            // 1. Fetch the absolute latest record from health table right before inserting the new one
            const lastPingQuery = await pool.query(`
                SELECT checked_at FROM bot_health 
                ORDER BY checked_at DESC LIMIT 1
            `);
            
            const lastRecord = lastPingQuery.rows[0];
            const now = new Date();

            if (lastRecord) {
                const lastPingTime = new Date(lastRecord.checked_at);
                const differenceMs = now.getTime() - lastPingTime.getTime();
                const thresholdMs = 15 * 60 * 1000; // 15-minute maximum boundary window

                // 2. Trigger broadcast loop if downtime validation rules pass
                if (differenceMs > thresholdMs) {
                    console.log(`Downtime detected! Gap: ${(differenceMs / 60000).toFixed(1)} mins. Notifying users...`);
                    
                    const activeUsers = await getUsers().catch((e) => console.log(e.message));
                   
                    // Concurrently dispatch notifications safely without blocking the thread
                 await  Promise.allSettled(
                        activeUsers.map(async (user) => {
                            // Enforce sending strictly to private chat spaces (not groups)
               
                            if (user.id) {
                                 bot.sendMessage(
                                    user.id, 
                                    "hey, i'm back up and running. sorry about that, things got a bit messy for a second 🫠"
                                );
                            }
                        })
                    ).catch((broadcastErr) => console.error("Global crash during announcement routing:", broadcastErr));
                }
            }

            const start = performance.now();
            await pool.query(`SELECT 1`);
            const end = performance.now();

            const timeElapsed = (end - start).toFixed(2);
            await saveHealth(timeElapsed);
            
            console.log("Self-ping successful ✅");

        } catch (err) {
            // Log failures without crashing process
            console.error("Self-ping failed ❌", err);
        }

    }, 10 * 60 * 1000); // 10 minutes interval
};
