import mongoose, { Document, Schema } from 'mongoose';
import { EnumFriend } from '../enums/schemaFriend.enum';

export interface IFriend extends Document {
    sendBy: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    status: EnumFriend;
    isBlockBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    acceptedAt?: Date;
}

const friendSchema: Schema<IFriend> = new mongoose.Schema(
    {
        sendBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(EnumFriend),
            default: EnumFriend.TYPE_PENDING,
        },
        isBlockBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        acceptedAt: {
            type: Date,
        },
    },
    { timestamps: true },
);

export default mongoose.model<IFriend>('Friend', friendSchema);