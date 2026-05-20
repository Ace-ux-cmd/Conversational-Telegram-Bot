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
    ];

    let currentIndex = 0;
    const startTime = Date.now();

    // Distribute load across available Api keys

    module.exports = async ()=>{
    const start = currentIndex;
       let isValid; 
       let key;
    do{

        key = apiKeys[currentIndex % apiKeys.length];
        currentIndex = (currentIndex + 1 )% apiKeys.length;

        isValid = await apiFunc(key);

        if ((Date.now() - startTime )/60000 >= 5) return null;

    }while(!isValid)
        return key;
    }