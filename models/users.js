// Import mongoose for MongoDB connection and schema definition
const mongoose = require('mongoose');

// Establish connection to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB connected')) // Successful connection log
    .catch(err => console.log('MongoDB connection error:', err)); // Connection failure log

// Define schema for storing user messages
const messageSchema = new mongoose.Schema({

    // Unique Telegram user ID
    userId: {
        type: Number,
        required: true,
        unique: true
    },

    // Display name / username of the user
    username: {
        type: String,
        required: true
    },

    // Array holding message history for the user
    messages: {
        type: Array,
        required: true,
        default: []
    }
});

// Export Mongoose model for CRUD operations on message data
module.exports = mongoose.model('Message', messageSchema);