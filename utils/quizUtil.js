// MODULE FOR QUIZ SETUP


const { v4: uuidv4 } = require('uuid');

function decodeHTMLEntities(text) {
    return text
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&deg;/g, '°');
}

async function getQuizData(msg) {
    const response = await fetch("https://opentdb.com/api.php?amount=1");
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) throw new Error("No questions found");
    const result = data.results[0];

    // Determine points based on difficulty
    let points = 1;
    if (result.difficulty === "medium") points = 3;
    if (result.difficulty === "hard") points = 5;

    // Mix answers
    const correctAnswer = decodeHTMLEntities(result.correct_answer);
    const optionsArray = [...result.incorrect_answers.map(decodeHTMLEntities), correctAnswer];
    const shuffledOptions = optionsArray.sort(() => Math.random() - 0.5);

    // Generate a unique short ID for this quiz instance to stay under 64 bytes
    const quizId = uuidv4().split('-')[0]; 

    // Build buttons securely.
    // callback_data format: "qz|[quizId]|[index]" -> keeping it extremely short
    const inlineKeyboard = shuffledOptions.map((option, index) => {
        return [{
            text: option,
            callback_data: `qz|${quizId}|${index}` 
        }];
    });

    const replyMessage = `⚙️ Type: ${result.type}\n🎚 Difficulty: ${result.difficulty}\n🗂 Category: ${result.category}\n\n🙋‍♂️ Question: ${decodeHTMLEntities(result.question)}`;

    return {
        quizId,
        points,
        correctAnswer,
        optionsArray: shuffledOptions, // returning this to map index to answer later
        text: replyMessage,
        options: {
            reply_to_message_id: msg.message_id,
            reply_markup: { inline_keyboard: inlineKeyboard }
        }
    };
}

module.exports = { getQuizData };