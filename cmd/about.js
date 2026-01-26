let uptime = (new Date()).toLocaleString()

module.exports = (bot) =>{
    bot.onText(/\/about/,async(msg)=>{
 let message;

//  Set message  
  message = `Idk, there isnt much to say, But okay. 
  I'm Katelyn, 18, mostly just trying to survive my classes without losing my mind.
  I spend way too much time staring at premiere pro cutting down boring clips for this internship because apparently thats my life now.
  I dont really trust people easily tbh because everyone is usually fake or wants something but if you aren't a snake then we're good i guess.
  I like music and staying in my own lane.
  That’s pretty much the whole vibe, nothing fancy`
 if(msg.from.id == process.env.BOT_OWNER_ID)  {
    message += `Been online since ${uptime}`
 }
 bot.sendMessage(msg.chat.id, message)
})
}
