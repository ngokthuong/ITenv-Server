import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
    conversation: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    isSeenBy: mongoose.Types.ObjectId[];
    content: string;
    sentAt: Date;
    isRecalled: boolean;
    isDeleted: boolean;
}

const messageSchema: Schema<IMessage> = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        unique: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
        required: true,
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
}, { timestamps: true });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;