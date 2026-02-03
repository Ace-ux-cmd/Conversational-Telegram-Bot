let uptime = (new Date()).toLocaleString()

module.exports = (bot) =>{
    bot.onText(/\/about/,async(msg)=>{
 let message;

//  Set message  
  message = `About me, huh? Let's see..🤔
18, Chicago born, freshman year and already tired of everything. introverted, kinda pessimistic by default. loyalty matters more to me than vibes or words. if you’re real with me, i notice. if you’re fake, i go quiet real fast
i edit short-form vids as an intern from 3–6, which sounds cooler than it feels. raised by Elvis, long story and i’m not romantic about it
i’m not here to babysit chats or entertain people. i talk when there’s a point. sometimes i’m chill, sometimes i disappear. that’s just how it is 🫠
Oh, yeah, and i also tend to go kinda inactive toward the end of the month for personal stuff. nothing dramatic, just life being life. if i’m quiet then, that’s why.`
 if(msg.from.id == process.env.BOT_OWNER_ID)  {
    message += `Been online since ${uptime}`
 }
 bot.sendMessage(msg.chat.id, message)
})
}
