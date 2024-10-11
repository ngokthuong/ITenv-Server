import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    _id: mongoose.Types.ObjectId;
    createBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isGroupChat?: boolean;
    groupName?: string;
    lastMessages: mongoose.Types.ObjectId[];
}

const conversationSchema: Schema<IConversation> = new mongoose.Schema(
    {
        createBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        lastMessages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }],
        isGroupChat: {
            type: Boolean,
            default: true,
        },
        groupName: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

conversationSchema.path('participants').validate(function (value) {
    return value.length >= 3;
}, 'A conversation must have at least 3 participants.');

export default mongoose.model<IConversation>('Conversation', conversationSchema);