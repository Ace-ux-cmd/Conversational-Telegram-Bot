// VOICE PROCESSING MODULE 'TTS' & 'STT'



const axios = require("axios");
const { wrapPcmToWav } = require("../utils/mediaFormatter");
const { saveRequests } = require("../models/aiRequestModel");


//Pipes a binary streaming audio payload straight into the Gemini model for STT processing.

async function processVoiceToText(fileStream, apiKey) {
    try {
        const chunks = [];
        for await (const chunk of fileStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        const base64Audio = audioBuffer.toString("base64");

        const requestBody = {
            contents: [{
                parts: [
                    {
                        inlineData: {
                            mimeType: "audio/ogg",
                            data: base64Audio
                        }
                    },
                    {
                        text: "Transcribe this audio precisely. Keep all informal speech, slang, contractions, stuttering, and raw conversational text. Do not correct typos or summarize."
                    }
                ]
            }]
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
            requestBody,
            { headers: { "Content-Type": "application/json" } }
        );

        const textOutput = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textOutput) throw new Error("Empty transcription text returned from the AI model engine.");

        return textOutput.trim();
    } catch (err) {
        console.error("Voice Engine STT Exception:", err.message);
        throw err;
    }
}

// Transforms standard text output into natural audio notes using the multimodal

async function generateVoiceFromText(text, apiKey, userRole = "user", currentUser) {
    
    try {
        let tone = "you speak in a casual, understated, and emotionally reactive way, using everyday language with light sarcasm, quiet confidence, and an unforced authenticity that shifts naturally from reserved to playful depending on who you are talking to."

         switch (userRole) {
            case "owner":
         tone += ` You are warm, soft, candid, affectionate.`
            break;
            case "admin":
        tone = ` You are relaxed, friendlier, more expressive.`
                break;
        }

     
        const requestBody = {
            contents: [{
                parts: [{ 
                    text: `Perform the following response naturally as Katelyn. 

Dialogue Script: "${text}"

Performance Direction:
1. Read the following transcript lines as written out with in this tone like a human: ${tone}
2. Include natural speech imperfections.
3. Mimic natural room acoustics. Blend subtle, faint environmental background ambiance (like distant low-fidelity room tone, faint coffee shop clatter, or soft rustling) into the audio generation so it sounds like a real person recording a raw voice note on their phone in a real space.
4. Speak with a casual freshman cadence using the voice profile.`
}]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            // Uses the stable native conversation profile option
                            voiceName: "Aoede" 
                        }
                    }
                }
            }
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`,
            requestBody,
            { headers: { "Content-Type": "application/json" } }
        );

        // Extract the native base64 block out of the multimodal structure safely
        const parts = response.data?.candidates?.[0]?.content?.parts;
        const audioPart = parts?.find(p => p.inlineData && p.inlineData.mimeType?.startsWith("audio/"));
        
        const base64AudioData = audioPart?.inlineData?.data;
        if (!base64AudioData) {
            throw new Error("No inline audio data returned from the native voice engine candidates profile framework.");
        }

        // Convert base64 data into a raw PCM buffer
        const rawPcmBuffer = Buffer.from(base64AudioData, 'base64');

        // Add proper WAV headers to fix the "file not supported" Telegram playback error
        const playableBuffer = wrapPcmToWav(rawPcmBuffer, 24000);
        await saveRequests(currentUser.chatId, currentUser.chatType, 'audio_gen', 'success')

        return playableBuffer;
        
    } catch (err) {
        const errMessage = err.response?.data || err.message
        await saveRequests(currentUser.chatId, currentUser.chatType, 'audio_gen', 'fail', errMessage)
        console.error("Voice Engine Native TTS Exception:", errMessage);
        throw err;
    }
}

module.exports = { processVoiceToText, generateVoiceFromText };