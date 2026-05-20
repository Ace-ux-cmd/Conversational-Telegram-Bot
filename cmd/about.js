// Capture the bot's startup time (used for uptime display)
let uptime = (new Date()).toLocaleString()

// Export a function that receives the bot instance
module.exports = (bot) => {

    // Listen for the "/about" command using regex
    bot.onText(/\/about/, async (msg) => {

        let message;

        // Base "about" message content
       message = `Me? okay fine 😭 18, chicago, first year. introverted and a little sarcastic but not in a mean way, more like... selectively social. if i'm actually talking to you it's because i want to, not out of obligation or boredom.
i don't really do performative energy. you'll know when i'm genuinely engaged vs just being polite lol
also fair warning i go quiet sometimes. not ghosting, just recharging. and end of month i basically fall off the grid, life gets loud, nothing deep 🫠`

        // If the message sender is the bot owner, append uptime info
        if (msg.from.id == process.env.BOT_OWNER_ID) {
            message += `Been online since ${uptime}`
        }

        // Send the final message to the chat where the command was triggered
        bot.sendMessage(msg.chat.id, message)
    })
}