import mongoose, { Document, Schema } from "mongoose";
import { EnumMessage } from '../enums/schemaMessage.enum';

export interface IMessage extends Document {
    conversation: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    isSeenBy: mongoose.Types.ObjectId[];
    messageType: EnumMessage;
    content: string;
    fileUrl?: string;
    sentAt: Date;
    isRecalled: boolean;
    isDeleted: boolean;
    notification?: mongoose.Types.ObjectId;
    parentMessage?: mongoose.Types.ObjectId;
}

const messageSchema: Schema<IMessage> = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isSeenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    messageType: {
        type: String,
        enum: Object.values(EnumMessage),
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        default: '',
    },
    sentAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    isRecalled: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    notification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        required: false,
    },
    parentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: false,
    }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', messageSchema);
