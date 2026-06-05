const axios = require('axios');
const sharp = require('sharp');

// Downloads a raw binary image asset from Telegram servers and downscales its geometry

async function prepareImageForGemini(bot, fileId) {
    try {
        const fileData = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileData.file_path}`;

        const response = await axios.get(fileUrl, { 
            responseType: 'arraybuffer',
            // Enforce strict connection boundaries to prevent thread-locking your queue
            timeout: 10000, // 10-second hard threshold termination drop
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/jpeg,image/png,image/*;q=0.8'
            }
        });
        
        const rawBuffer = Buffer.from(response.data);

        const resizedBuffer = await sharp(rawBuffer)
            .resize({
                width: 1024,
                height: 1024,
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        return {
            inlineData: {
                data: resizedBuffer.toString("base64"),
                mimeType: "image/jpeg"
            }
        };
    } catch (err) {
        // Intercept and throw context-specific diagnostics
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            throw new Error(`Telegram media storage gateway timed out during asset synchronization.`);
        }
        throw new Error(`Failed to process media buffer pipeline: ${err.message}`);
    }
}

module.exports = { prepareImageForGemini };