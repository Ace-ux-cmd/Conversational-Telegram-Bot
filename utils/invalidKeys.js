// FUNCTION TO STORE INVALID API KEYS AND RELEASE AFTER COOLDOWN


    const invalidKeys = new Map();

    function releaseKey(){
        invalidKeys.forEach((time, key) =>{
        if(Date.now() - time >= 1000 * 3600 * 2){
            invalidKeys.delete(key)
        }
    })
    }

    setInterval(releaseKey, (1000 * 60 * 30) )
    module.exports = invalidKeys;