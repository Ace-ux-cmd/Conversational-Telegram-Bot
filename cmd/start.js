// Export a function that registers bot command handlers
module.exports = (bot) => {

    // Listen for the "/start" command (entry point for new users)
    bot.onText(/\/start/, (msg) => {

        // Construct a personalized welcome message using the user's first name
       const welcomeMessage = `Hey ${msg.chat.first_name} 👋 just got off a shift so my brain is half here lol
i'm katelyn. chicago, freshman year, generally quiet unless you actually talk to me
tag or reply if you need me, dms work too just don't go crazy 😴
/support for updates or the group
/callad for admin
/about if you're curious
okay yeah. hi 🫠`

        // Send the welcome message to the chat where the command was triggered
        bot.sendMessage(msg.chat.id, welcomeMessage);
    })
}