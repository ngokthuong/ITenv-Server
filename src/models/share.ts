import mongoose, { Document, Schema } from "mongoose";

interface IShare extends Document {
    _id: mongoose.Types.ObjectId;
    sharedBy: mongoose.Types.ObjectId;
    sharedToUser: mongoose.Types.ObjectId;
    sharedToCvstion: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
}

const ShareSchema: Schema<IShare> = new Schema({
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sharedToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sharedToCvstion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    }
}, { timestamps: true });

export default mongoose.model<IShare>('Share', ShareSchema);
