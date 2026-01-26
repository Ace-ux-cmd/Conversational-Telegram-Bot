module.exports = (bot)=>{
    bot.onText(/\/callad/, (msg)=>{  
        bot.sendMessage(msg.chat.id, "Got any problems?",{
            reply_to_message_id: msg.message_id,
        reply_markup:{
            inline_keyboard:[
                [{text: "Message Elvis", url:"https://t.me/chidalumb100"}],
                [{text: "Message Ace'", url:"https://t.me/elvismb10"}],
                [{ text: "📱🟢💬 Message Admin on WhatsApp", url: "https://wa.me/+2347054971517" }],
                [{ text: "📘💬 Add on Facebook", url: "https://www.facebook.com/profile.php?id=61578323177234" }]
            ]
        }
    })
    })
}
