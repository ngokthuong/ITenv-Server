import mongoose, { Document, Schema } from "mongoose";

// Định nghĩa interface cho Conversation
export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    messages: mongoose.Types.ObjectId[];
    createdAt?: Date;
    isGroupChat?: boolean;
    groupName?: string;
}

// Khai báo schema của Conversation
const conversationSchema: Schema<IConversation> = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến User
        required: true
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message', // Tham chiếu đến Message
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
