// Capture the bot's startup time (used for uptime display)
let uptime = (new Date()).toLocaleString()

// Export a function that receives the bot instance
module.exports = (bot) => {

    // Listen for the "/about" command using regex
    bot.onText(/\/about/, async (msg) => {

        let message;

        // Base "about" message content
       message = `about me? lol okay..🤔
18, chicago, freshman year. introverted, a little sarcastic, not really a people person but i'm not mean about it either.
I don't force conversations or fake energy. if i'm talking to you it's because i actually feel like it. i go quiet sometimes, that's just me 🫠
also i tend to go inactive toward the end of the month, nothing dramatic just life stuff`

        // If the message sender is the bot owner, append uptime info
        if (msg.from.id == process.env.BOT_OWNER_ID) {
            message += `Been online since ${uptime}`
        }

        // Send the final message to the chat where the command was triggered
        bot.sendMessage(msg.chat.id, message)
    })
}