const { getQuizData } = require("../utils/quizUtil");
const { upsertUserScore } = require("../models/leaderboardModel");

// Server-side state store
const activeQuizzes = new Map();

module.exports = (bot) => {
    
    // Run the quiz
    bot.onText(/\/quiz/, async (msg) => {
        const chatId = msg.chat.id;
        const isPrivateChat = msg.chat.type === "private";

        try {
            const quiz = await getQuizData(msg);
            
            // Store the correct answer details securely on the server
            activeQuizzes.set(quiz.quizId, {
                correctAnswer: quiz.correctAnswer,
                options: quiz.optionsArray,
                points: quiz.points
            });

            const quizMsg = await bot.sendMessage(chatId, quiz.text, quiz.options);

            if (isPrivateChat) {
                bot.deleteMessage(chatId, msg.message_id).catch(() => {});
            }

            // Auto-delete state and message after 15 seconds
            setTimeout(() => {
                activeQuizzes.delete(quiz.quizId); // Clean up memory
                bot.deleteMessage(chatId, quizMsg.message_id).catch(() => {});
            }, 15000);

        } catch (err) {
            console.error(err.message);
            bot.sendMessage(chatId, "❌ Couldn't load the quiz. Try again!");
        }
    });

    // Validate results securely on the server side
    bot.on("callback_query", async (query) => {
        const [prefix, quizId, selectedIndexStr] = query.data.split("|");
        
        // Filter out non-quiz callbacks
        if (prefix !== "qz") return;

        const chatId = query.message.chat.id;
        const selectedIndex = parseInt(selectedIndexStr, 10);

        // Fetch the quiz details from server memory
        const savedQuiz = activeQuizzes.get(quizId);

        // If quiz expired or button was clicked twice
        if (!savedQuiz) {
            await bot.answerCallbackQuery(query.id, {
                text: "⏰ This quiz has expired or already been answered!",
                show_alert: true
            });
            bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
            return;
        }

        // Remove from active tracking so no one else can exploit/re-click it
        activeQuizzes.delete(quizId);
        bot.deleteMessage(chatId, query.message.message_id).catch(() => {});

        // Reconstruct reality safely on our side
        const userAnswer = savedQuiz.options[selectedIndex];
        const isCorrect = userAnswer === savedQuiz.correctAnswer;

        if (isCorrect) {
            try {
                await upsertUserScore(query.from.id, query.from.username || "Anonymous", savedQuiz.points);
                
                await bot.answerCallbackQuery(query.id, {
                    text: `🎉 Correct! +${savedQuiz.points} points added to your score.`,
                    show_alert: false
                });
            } catch (err) {
                await bot.answerCallbackQuery(query.id, {
                    text: "🎉 Correct! (But your score couldn't be saved right now)",
                    show_alert: true
                });
            }
        } else {
            await bot.answerCallbackQuery(query.id, {
                text: `😬 Oops, that wasn't correct! The right answer was: ${savedQuiz.correctAnswer}`,
                show_alert: true
            });
        }
    });
};