 const apiFunc = require ("./validateApiKey");

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
        process.env.GOOGLE_API_KEY0
    ].filter(Boolean); // Cleans out any missing/undefined environment variables

    let currentIndex = 0;

    // Distribute load across available Api keys
    module.exports = async ()=>{

        //  Initialize tracking variables *inside* the function scope
    const startTime = Date.now();
    const start = currentIndex;
    let isValid; 
    let key;

    do{

        // Safely grab and rotate the index
        key = apiKeys[currentIndex];
        currentIndex = (currentIndex + 1 )% apiKeys.length;

        // Validate the current key
        isValid = await apiFunc(key);

        // Safety Guard A: Localized timeout (Max 1 minute per request cycle)
        if ((Date.now() - startTime )/60000 >= 5) return key;

    }while(!isValid)
        return key;
    }