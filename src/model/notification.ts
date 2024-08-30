import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    iSeen: {
        type: Boolean,
        default: false
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

//Export the model
export default mongoose.model('Notification', notificationSchema);