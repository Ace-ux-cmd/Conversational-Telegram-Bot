// MODULE FOR GROUP EVENTS HANDLING


const fs = require("fs");
const path = require("path");
const { saveGroup, deleteGroup } = require("../models/groupsModel");
const { addMember, removeMembers } = require("../models/groupMembersModel");
const { deleteUser } = require("../models/userModel");

const gifPath = path.join(__dirname, "../media/welcome.gif");

module.exports = (bot)=>{
bot.on('my_chat_member', async(update) => {
  const chatId = update.chat.id;
  const newStatus = update.new_chat_member.status;
  const chatType = update.chat.type

  // Check if the bot was added to the group
  if (newStatus === 'member' || newStatus === 'administrator') {

    if (chatType === "group" || chatType === "supergroup") {
    const chatAdmin = await bot.getChatAdministrators(chatId)
    const groupOwner = chatAdmin.find(n => n.status === "creator");
      await saveGroup(chatId, update.chat.title, update.chat.type, groupOwner.user.id);
      
    bot.sendAnimation(
      update.chat.id,
      fs.createReadStream(gifPath)
    ).catch((e)=> console.error(e.message));
  }
            
}
  
console.log(update);
  // Check if the bot was kicked/removed
  if (newStatus === 'left' || newStatus === 'kicked') {
    await deleteGroup(chatId);
      await deleteUser(chatId);
    console.log(`Bot was removed from chat: ${chatId}`);
  }
});

// Check for new members
bot.on("new_chat_members", async(update)=>{
try {
  await addMember(update.chat.id, update.new_chat_participant.id, 'member', update.new_chat_participant.first_name, new Date());
  await bot.sendMessage(update.chat.id, `Welcome, to my gc ${update.new_chat_participant.first_name},\n\n Reply to this message to continue chat`)
} catch (e) {
  console.log("Error adding new chat member:", e.message);
}
});

bot.on("left_chat_member", async(update)=>{
try {
  await removeMembers(update.chat.id, update.left_chat_participant.id);;
} catch (e) {
  console.log("Error removing left chat member:", e.message);
  
}
})
}