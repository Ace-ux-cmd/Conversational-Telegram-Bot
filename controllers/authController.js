// Import the user memory model
const Memory = require("../models/users");

// Retrieve an existing user or create one if it doesn't exist
async function getUser(id, name) {

    // Attempt to find a user record by their unique user ID
    let user = await Memory.findOne({ userId: id });

    // If no user is found, create a new record
    if (!user) {
        user = await Memory.create({
            userId: id,     // Store unique identifier (e.g., Telegram user ID)
            username: name  // Store user's name/username for reference
        });
    }

    // Return the existing or newly created user object
    return user;
}

// Export the function for reuse across the application
module.exports = getUser;