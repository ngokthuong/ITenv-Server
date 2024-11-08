import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    _id: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isGroupChat?: boolean;
    groupName?: string;
    isDeleted?: boolean
    lastMessage?: mongoose.Types.ObjectId;
}

const conversationSchema: Schema<IConversation> = new mongoose.Schema(
    {
        createdBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        groupName: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    { timestamps: true }
);

// conversationSchema.path('participants').validate(function (value) {
//     return value.length >= 3;
// }, 'A conversation must have at least 3 participants.');

export default mongoose.model<IConversation>('Conversation', conversationSchema);