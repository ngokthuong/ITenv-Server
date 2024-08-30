import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến User
        required: true
    }],
    messages: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Tham chiếu đến User
            required: true
        },
        content: {
            type: String,
            required: true
        },
        isSeen: {
            type: Boolean,
            default: false
        },
        sentAt: {
            type: Date
        }
    }],
    createAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Conversation', conversationSchema);