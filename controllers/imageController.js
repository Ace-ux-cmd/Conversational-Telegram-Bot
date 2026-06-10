// MODULE FOR IMAGE PROCESSING HANDING


const { prepareImageForGemini } = require("../utils/imageBuffer");
const { generateImageAnalysis } = require("../service/imageService");

const { saveMessage } = require("../models/messagesModel");
const { updateGroupInteraction } = require("../models/groupsModel");
const { updateUserInteraction } = require("../models/userModel");
const { saveRequests } = require("../models/aiRequestModel");

async function handleImageMessage(bot, msg, userProfile) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const isGroup = msg.chat.type !== "private" && msg.chat.type !== "channel";

    try {
        const captionText = msg.caption || "";
        const replyContext = msg.reply_to_message;
        const botTag = "@kathill";

        if (isGroup) {
            if (msg.from.is_bot) return;

            const lowerCaption = captionText.toLowerCase();
            const wasRepliedToMe = replyContext && replyContext.from?.username === "kathill_bot";
            const isMentioned = lowerCaption.includes("katelyn") || lowerCaption.includes(botTag) || lowerCaption.includes("kat");

            if (!wasRepliedToMe && !isMentioned) return;
        }

        await bot.sendChatAction(chatId, "typing");

        const photoSelection = msg.photo[msg.photo.length - 1];
        const processedImagePart = await prepareImageForGemini(bot, photoSelection.file_id);
        
        // Destructure the structured response output targets
        const { chatResponse, imageDescription } = await generateImageAnalysis(
            msg.from.id, 
            msg.from.first_name, 
            captionText, 
            processedImagePart
        );

        // Commit the precise description record text block into history storage logs
        if (!isGroup) {
            const historyLogText = captionText.trim()
                ? `${imageDescription} Image | Caption: ${captionText}`
                : `${imageDescription} image`;
            await saveMessage(msg.message_id, userId, "user", historyLogText);
        }

        const sentMessage = await bot.sendMessage(chatId, chatResponse, {
            reply_to_message_id: msg.message_id
        });

        if (!isGroup) {
            await saveMessage(sentMessage.message_id, userId, "model", chatResponse, msg.message_id); 
            await updateUserInteraction(userId);
        } else {
            await updateGroupInteraction(chatId);
        }

        await saveRequests(chatId, msg.chat.type, 'image_read', "success");

    } catch (err) {
        await saveRequests(chatId, msg.chat.type, 'image_read', "fail", err.message);
        console.error("Critical routing processing failure within image controller:", err.message);
        
        await bot.sendMessage(
            chatId,
            "sorry, my head hurts trying to look at that picture right now... try sending it again later maybe? 🫠",
            { reply_to_message_id: msg.message_id }
        ).catch(() => {});
    }
}

module.exports = { handleImageMessage };