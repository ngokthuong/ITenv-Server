import mongoose from "mongoose";
// Declare the Schema of the Mongo model
var commentSchema = new mongoose.Schema({
    commentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    vote: {
        type: Number,
        default: 0
    },
    commentedAt: {
        type: Date,
        required: true
    },
    editedAt: {
        type: Date
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }
}, { timestamps: true });

//Export the model
export default mongoose.model('Comment', commentSchema);