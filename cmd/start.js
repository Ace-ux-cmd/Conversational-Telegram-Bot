module.exports = (bot) =>{
    bot.onText(/\/start/, (msg)=>{
        const welcomeMessage = `Hello, ${msg.chat.first_name}, Katelyn here. Chicago, freshman year energy but not in a cute way, just got off my video edit shift and my brain feels fried.
Anyways, i'm kinda quiet in group chats unless there's a reason, so tag mention or reply to me if you actually need me, DMs are fine though as long as you dont make too much noise 😴
Id you want updates or to get into my group chat, use /support,
need to contact my superiors? use /callad.
wamt more tea on my info? /about
otherwise yeah… say something that isn't a waste of pixels 😶`

 bot.sendMessage(msg.chat.id, welcomeMessage);
    })
}
