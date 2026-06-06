//  Require invalidKeys map from external module
const invalidKeys = require("./invalidKeys");

 // List of API keys for load balancing / fallback rotation
    const apiKeys = [
        process.env.GOOGLE_API_KEY1,
        process.env.GOOGLE_API_KEY2,
        process.env.GOOGLE_API_KEY3,
        process.env.GOOGLE_API_KEY4,
        process.env.GOOGLE_API_KEY5,
        process.env.GOOGLE_API_KEY6,
        process.env.GOOGLE_API_KEY7, 
        process.env.GOOGLE_API_KEY8, 
        process.env.GOOGLE_API_KEY9, 
        process.env.GOOGLE_API_KEY0,
        process.env.GEMINI_API_KEY1,
        process.env.GEMINI_API_KEY2,
        process.env.GEMINI_API_KEY3,
        process.env.GEMINI_API_KEY4,
        process.env.GEMINI_API_KEY5,
        process.env.GEMINI_API_KEY6,
        process.env.GEMINI_API_KEY7,
        process.env.GEMINI_API_KEY8,
        process.env.GEMINI_API_KEY9,
        process.env.GEMINI_API_KEY0
    ].filter(Boolean); // Cleans out any missing/undefined environment variables

    let currentIndex = 0;
    
    // Distribute load across available Api keys
    module.exports = async ()=>{

    let startIndex = currentIndex //  A variable to monitor api rotation and avoid infinite loops

        //  Initialize tracking variables *inside* the function scope
    let key;
    do {
        // Safely grab and rotate the index
        key = apiKeys[currentIndex];
        currentIndex = (currentIndex + 1 )% apiKeys.length;

        if(startIndex === currentIndex) return key //Handles invalid key in aiResponse function
}while(invalidKeys.has(key) || !key)
        return key;
    }