module.exports = (bot) =>{
    bot.onText(/\/start/, (msg)=>{
        const welcomeMessage = `Nice to meet you ${msg.chat.first_name}. I'm Hey. I’m Katelyn, your conversational partner.
In groups, I don’t usually talk unless there’s a reason.So mention or tag me if you want my attention.
However, private chats are fair game.
If you want updates or a little chaos in my group chat, /support gets you there.
If you need to reach my admins directly, try /callad.
Wanna know a bit more about me? /about.
Otherwise… say something worth responding to.`

 bot.sendMessage(msg.chat.id, welcomeMessage);
    })
}
