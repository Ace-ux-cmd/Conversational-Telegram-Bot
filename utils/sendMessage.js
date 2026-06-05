module.exports = async (bot, id, msg) =>{
try {
    await bot.sendMessage(id, msg);
} catch (e) {
    throw new Error(`Error sending message ${e.message}`);
}
} 