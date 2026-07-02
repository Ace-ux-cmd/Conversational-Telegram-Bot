// Helper function to wrap raw 24kHz 16-bit Mono PCM data into a standard playable WAV container.

function wrapPcmToWav(pcmBuffer, sampleRate = 24000) {
    const numChannels = 1; // Mono
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmBuffer.length;
    const chunkSize = 36 + dataSize;

    const header = Buffer.alloc(44);

    // RIFF identifier
    header.write('RIFF', 0);
    header.writeUInt32LE(chunkSize, 4);
    header.write('WAVE', 8);

    // format subchunk identifier
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);         // Subchunk1Size for PCM
    header.writeUInt16LE(1, 20);          // AudioFormat (1 = Uncompressed PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);

    // data subchunk identifier
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    // Combine the structured 44-byte WAV header with the raw PCM audio bytes
    return Buffer.concat([header, pcmBuffer]);
}

module.exports = {
    wrapPcmToWav
}