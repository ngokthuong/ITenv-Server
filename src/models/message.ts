import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        require: true,
        unique: true
    },
    serder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
        unique: true,
    },
    isSeenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    content: {
        type: String,
        required: true,
    },
    sentAt: {
        type: Date,
        require: true,
        default: Date.now
    },
    isRecalled: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

//Export the model
export default mongoose.model('Message', messageSchema);