// MODULE FOR PROCESSING VOICE MESSAGES


const axios = require("axios");
const { processVoiceToText } = require("../service/voiceService");
const { saveRequests } = require("../models/aiRequestModel");

// Intercepts binary voice notes, extracts their text transcription, and routes the context back into the main loop.
async function handleIncomingVoice(bot, currentUser, fileId, executePipelineCallback) {
    try {
        const fileLink = await bot.getFileLink(fileId);
        
        const responseStream = await axios({
            method: "GET",
            url: fileLink,
            responseType: "stream"
        });

        const activeKey = currentUser.assignedKey;
        if (!activeKey) {
            throw new Error("Missing assigned API rotation key signature required to invoke transcription services.");
        }

        const transcribedText = await processVoiceToText(responseStream.data, activeKey);
        console.log(`[Voice Entry Transcribed] User ID ${currentUser.userId}: "${transcribedText}"`);

        // Inject transcription back as a standard user text field mutation
        currentUser.message = transcribedText;

        // Re-execute standard controller processing without cluttering queue latency
        await executePipelineCallback(bot, currentUser);
        await saveRequests(currentUser.chatId, currentUser.chatType, 'voice_listen', 'success')

    } catch (err) {
        console.error("Voice Ingestion Controller Failure:", err.message);
        await saveRequests(currentUser.chatId, currentUser.chatType, 'voice_listen', 'fail', err.message)

        try {
            await bot.sendMessage(currentUser.chatId, "uh, my phone is glitching out and i couldn't play your voice note properly... mind just typing it out?");
        } catch (msgErr) {
            console.error("Failed to notify user of failed voice processing:", msgErr.message);
        }
    }
}

module.exports = { handleIncomingVoice };