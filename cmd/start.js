module.exports = (bot) =>{
    bot.onText(/\/start/, (msg)=>{
        const welcomeMessage = `Nice to meet you ${msg.chat.first_name}.  I'm Katelyn, your conversational partner.
In groups, I don't usually talk unless there's a reason. So if you want my attention, mention or tag me.
However, private chats are fair game.
If you want updates or join my group chat, /support gets you there.
If you need to reach my admins directly, try /callad.
Wanna know a bit more about me? /about.
Otherwise… say something worth responding to.`

 bot.sendMessage(msg.chat.id, welcomeMessage);
    })
}
