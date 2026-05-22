module.exports = async(apiKey)=>{

    // Api key Url to fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try{

         // Fetch api key using GET method
    const res = await fetch(url, {
        method: "GET"
    });

    // Checks for status code (200 - 299)
    if(res.ok){
        return true;
    }

    // Returns false if key is invalid (400 - 499)
    const errData = await res.json();
    console.error(errData.error?.message || res.statusText);
    return false;

}catch(e){

        console.error("Error Validating api key", e.message);
        return false;
    }
}