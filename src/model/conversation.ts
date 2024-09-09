import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến User
        required: true
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message', // Tham chiếu đến User
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Conversation', conversationSchema);