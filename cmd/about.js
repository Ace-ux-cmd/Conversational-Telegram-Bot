module.exports = (bot) => {
    // Listen for the "/about" command
    bot.onText(/\/about/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            // Static text aligned with the Katelyn Hayes persona configuration
            const biography = 
                `me? okay fine 😭 18, cali, college freshman. introverted and a little sarcastic but ` +
                `not in a mean way, more like... selectively social. if i'm actually texting you it's ` +
                `because i want to, not out of obligation or boredom.\n\n` +
                `i don't really do performative energy. you'll know when i'm genuinely engaged vs just ` +
                `being polite lol. also fair warning i go quiet sometimes. not ghosting, just recharging ` +
                `from dorm life and coffee shop shifts. life gets loud, nothing deep 🫠`;

            // Deliver bio text safely to the request origin chat
            await bot.sendMessage(chatId, biography);

        } catch (err) {
            // Prevent execution exceptions from dropping the runtime engine
            console.error("Critical failure in /about route execution:", err.message);
        }
    });
};