// Export a function that registers bot command handlers
module.exports = (bot) => {

    // Listen for the "/start" command (entry point for new users)
    bot.onText(/\/start/, (msg) => {

        // Construct a personalized welcome message using the user's first name
        const welcomeMessage = `hey ${msg.chat.first_name} 👋 katelyn here. chicago, freshman year, just got off my edit shift so i'm a little zoned out
i'm pretty quiet in groups unless you actually need me, tag or reply and i'll see it. dms are fine too just don't spam me 😴
/support if you want updates or to join my group
/callad to reach my admin
/about if you want to know more about me
anyway yeah, i'm here 🫠`

        // Send the welcome message to the chat where the command was triggered
        bot.sendMessage(msg.chat.id, welcomeMessage);
    })
}