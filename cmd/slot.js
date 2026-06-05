// routes/slot.js
const { getScore, upsertUserScore } = require("../models/leaderboardModel");

module.exports = (bot) => {
    const symbols = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎"];

    // Initial /slot command - Main Game Menu
    bot.onText(/\/slot/, async (msg) => {
        const chatId = msg.chat.id;
        
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🎰 Slot Machine", callback_data: "menu|slot" },
                        { text: "🪨 Rock, Paper, Scissors", callback_data: "menu|rps" }
                    ]
                ]
            }
        };

        if (msg.chat.type === "private") {
            bot.deleteMessage(chatId, msg.message_id).catch(() => {});
        }

        const menuMsg = await bot.sendMessage(chatId, "🎮 **Welcome to the Mini-Casino!**\nSelect a game to start playing:", {
            parse_mode: "Markdown",
            ...opts
        });

        // 15-second unmanaged auto-delete hook
        setTimeout(() => {
            bot.deleteMessage(chatId, menuMsg.message_id).catch(() => {});
        }, 15000);
    });

    // Main Callback Handling State Machine
    bot.on("callback_query", async (query) => {
        if (!query.data) return;

        const [action, value, extra] = query.data.split("|");

        const recognizedActions = ["menu", "bet_slot", "bet_rps", "nav", "play_rps"];
        if (!recognizedActions.includes(action)) return;

        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const userId = query.from.id;
        const username = query.from.username || "Anonymous";

        // Helper function to catch 400 errors when a message was deleted mid-flight
        const handleMissingMessage = async (err) => {
            if (err.message.includes("message to edit not found")) {
                await bot.answerCallbackQuery(query.id).catch(() => {});
                return bot.sendMessage(chatId, "⚠️ **Session Expired!** The game menu timed out. Please send /slot to start a new game.", { parse_mode: "Markdown" });
            }
            console.error("Unhandled edit error:", err.message);
        };

        // Route: Game Selection Menus -> Goes to Bet Selection Screen
        if (action === "menu") {
            const gameTitle = value === "slot" ? "🎰 **Slot Machine**" : "🪨 **Rock, Paper, Scissors**";
            const prefix = value === "slot" ? "bet_slot" : "bet_rps";

            const opts = {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "10", callback_data: `${prefix}|10` },
                            { text: "25", callback_data: `${prefix}|25` },
                            { text: "50", callback_data: `${prefix}|50` },
                            { text: "100", callback_data: `${prefix}|100` }
                        ],
                        [{ text: "💰 ALL IN", callback_data: `${prefix}|all` }],
                        [{ text: "🔙 Back to Menu", callback_data: "nav|main" }]
                    ]
                }
            };
            return bot.editMessageText(`${gameTitle}\nSelect your bet amount:`, { parse_mode: "Markdown", ...opts }).catch(handleMissingMessage);
        }

        // Route: RPS Move Selection Screen (Triggered after a valid bet choice)
        if (action === "bet_rps") {
            try {
                const currentScore = await getScore(userId) || 0;
                let bet = value === "all" ? currentScore : parseInt(value, 10);

                if (bet <= 0 || currentScore < bet) {
                    return bot.answerCallbackQuery(query.id, {
                        text: bet <= 0 ? "❌ You don't have points to bet!" : `❌ Insufficient balance! You have ${currentScore} points.`,
                        show_alert: true
                    });
                }

                const opts = {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "🪨 Rock", callback_data: `play_rps|rock|${value}` },
                                { text: "📄 Paper", callback_data: `play_rps|paper|${value}` },
                                { text: "✂️ Scissors", callback_data: `play_rps|scissors|${value}` }
                            ],
                            [{ text: "🔙 Cancel Bet", callback_data: "menu|rps" }]
                        ]
                    }
                };
                return bot.editMessageText(`🪨 **RPS Match Setup**\n**Active Bet:** ${bet} points\nChoose your combat move:`, { parse_mode: "Markdown", ...opts }).catch(handleMissingMessage);
            } catch (err) {
                console.error("RPS validation failed:", err.message);
                return bot.answerCallbackQuery(query.id, { text: "❌ System transaction error.", show_alert: true });
            }
        }

        // Route: Navigation Back Track
        if (action === "nav" && value === "main") {
            const opts = {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "🎰 Slot Machine", callback_data: "menu|slot" },
                            { text: "🪨 Rock, Paper, Scissors", callback_data: "menu|rps" }
                        ]
                    ]
                }
            };
            return bot.editMessageText("🎮 **Welcome to the Mini-Casino!**\nSelect a game to start playing:", { parse_mode: "Markdown", ...opts }).catch(handleMissingMessage);
        }

        // Route: Slot Machine Logic Execution
        if (action === "bet_slot") {
            try {
                // Intercept deletion races right at the start of the spin state transition
                await bot.editMessageText("🎰 **Spinning the reels... Please wait.**", { chat_id: chatId, message_id: messageId }).catch(handleMissingMessage);

                const preCheckScore = await getScore(userId) || 0;
                let bet = value === "all" ? preCheckScore : parseInt(value, 10);

                if (bet <= 0 || preCheckScore < bet) {
                    return bot.answerCallbackQuery(query.id, { text: `❌ Insufficient balance! You need ${bet} points.`, show_alert: true });
                }

                await upsertUserScore(userId, username, -bet);

                const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
                const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
                const reel3 = symbols[Math.floor(Math.random() * symbols.length)];
                const visualResult = `[ ${reel1} | ${reel2} | ${reel3} ]`;

                const uniqueSymbols = new Set([reel1, reel2, reel3]).size;
                let payout = 0;
                let resultMessage = "";

                if (uniqueSymbols === 1) {
                    payout = bet * 3; 
                    resultMessage = `🎉 **JACKPOT!** You matched all 3!\n**Won:** +${payout - bet} net points.`;
                } else if (uniqueSymbols === 2) {
                    payout = bet;     
                    resultMessage = `⚖️ **Break Even!** 2 symbols matched.\nYour bet was returned.`;
                } else {
                    payout = 0;       
                    resultMessage = `😭 **You Lost!** Better luck next time.\n**Lost:** -${bet} points.`;
                }

                if (payout > 0) {
                    await upsertUserScore(userId, username, payout);
                }

                const postGameScore = await getScore(userId) || 0;

                const opts = {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [[{ text: "🎰 Play Again", callback_data: "menu|slot" }]]
                    }
                };

                await bot.answerCallbackQuery(query.id).catch(() => {});
                await bot.editMessageText(
                    `🎰 **SLOT MACHINE RESULT**\n\n${visualResult}\n\n${resultMessage}\n💰 **New Balance:** ${postGameScore} points.`,
                    { parse_mode: "Markdown", ...opts }
                ).catch(handleMissingMessage);

            } catch (err) {
                console.error("Slot execution failed:", err.message);
                bot.answerCallbackQuery(query.id, { text: "❌ Transaction aborted due to internal balance error.", show_alert: true }).catch(() => {});
            }
        }

        // Route: RPS Logic Execution
        if (action === "play_rps") {
            try {
                // Intercept deletion races right at the start of the combat state transition
                await bot.editMessageText("🪨 **Simulating combat choices... Please wait.**", { chat_id: chatId, message_id: messageId }).catch(handleMissingMessage);

                const userMove = value;
                const rawBetValue = extra;

                const preCheckScore = await getScore(userId) || 0;
                let bet = rawBetValue === "all" ? preCheckScore : parseInt(rawBetValue, 10);

                if (bet <= 0 || preCheckScore < bet) {
                    return bot.answerCallbackQuery(query.id, { text: `❌ Insufficient balance! You need ${bet} points.`, show_alert: true });
                }

                await upsertUserScore(userId, username, -bet);

                const rpsMoves = ["rock", "paper", "scissors"];
                const botMove = rpsMoves[Math.floor(Math.random() * rpsMoves.length)];
                
                const moveEmojis = { rock: "🪨 Rock", paper: "📄 Paper", scissors: "✂️ Scissors" };
                let payout = 0;
                let outcome = "";

                if (userMove === botMove) {
                    payout = bet; 
                    outcome = "🤝 **It's a Tie!** Both chose the same path.\nYour bet was returned.";
                } else if (
                    (userMove === "rock" && botMove === "scissors") ||
                    (userMove === "paper" && botMove === "rock") ||
                    (userMove === "scissors" && botMove === "paper")
                ) {
                    payout = bet * 2; 
                    outcome = `🏆 **You Win!** Victory is yours.\n**Won:** +${bet} net points.`;
                } else {
                    payout = 0;       
                    outcome = `💀 **You Lose!** The bot outsmarted you.\n**Lost:** -${bet} points.`;
                }

                if (payout > 0) {
                    await upsertUserScore(userId, username, payout);
                }

                const postGameScore = await getScore(userId) || 0;

                const opts = {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [[{ text: "🪨 Play Again", callback_data: "menu|rps" }]]
                    }
                };

                await bot.answerCallbackQuery(query.id).catch(() => {});
                await bot.editMessageText(
                    `🪨 **RPS RESOLUTION**\n\n👤 **You:** ${moveEmojis[userMove]}\n🤖 **Bot:** ${moveEmojis[botMove]}\n\n${outcome}\n💰 **New Balance:** ${postGameScore} points.`,
                    { parse_mode: "Markdown", ...opts }
                ).catch(handleMissingMessage);
            } catch (err) {
                console.error("RPS match execution failed:", err.message);
                bot.answerCallbackQuery(query.id, { text: "❌ Transaction aborted due to internal balance error.", show_alert: true }).catch(() => {});
            }
        }
    });
};