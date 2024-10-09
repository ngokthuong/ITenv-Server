import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    createdAt?: Date;
    isGroupChat?: boolean;
    groupName?: string;
    lastMessages: mongoose.Types.ObjectId[];
}

const conversationSchema: Schema<IConversation> = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        lastMessages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        }],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        groupName: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

export default mongoose.model<IConversation>('Conversation', conversationSchema);