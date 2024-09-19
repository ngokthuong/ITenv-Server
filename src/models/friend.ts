import mongoose, { Document, Schema } from "mongoose";

export interface IFriend extends Document {
    user1: mongoose.Types.ObjectId;
    user2: mongoose.Types.ObjectId;
    status: 'PENDING' | 'ACCEPT' | 'BLOCKED';
    createdAt?: Date;
    acceptedAt?: Date;
}

const friendSchema: Schema<IFriend> = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPT', 'BLOCKED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model<IFriend>('Friend', friendSchema);
