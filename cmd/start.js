module.exports = (bot) =>{
    bot.onText(/\/start/, (msg)=>{
        const welcomeMessage = `Nice to meet you ${msg.chat.first_name}. I'm Mirai.
If you want updates or chaos in a group chat, /support gets you there.
Or use /callad if you wish to message my admins`

 bot.sendMessage(msg.chat.id, welcomeMessage);
    })
}