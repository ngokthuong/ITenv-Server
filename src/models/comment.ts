import { required } from "joi";
import mongoose from "mongoose";

interface IComment extends Document {
    _id: mongoose.Types.ObjectId;
    commentBy: mongoose.Types.ObjectId;
    vote: Number;
    commentedAt: Date;
    editedAt: Date;
    parentComment: mongoose.Types.ObjectId;
}


// Declare the Schema of the Mongo model
var commentSchema = new mongoose.Schema({
    commentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vote: {
        type: Number,
        default: 0
    },
    commentedAt: {
        type: Date,
        default: Date.now
    },
    editedAt: {
        type: Date
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }
}, { timestamps: true });

export default mongoose.model<IComment>('Comment', commentSchema);