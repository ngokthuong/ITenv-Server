import mongoose from "mongoose";
// Declare the Schema of the Mongo model
var postSchema = new mongoose.Schema({
    postBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    view: {
        type: Number,
        default: 0
    },
    vote: {
        type: Number,
        default: 0
    },
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    postAt: {
        type: Date,
        default: Date.now
    },
    editAt: {
        type: Date
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

//Export the model
export default mongoose.model('Post', postSchema);