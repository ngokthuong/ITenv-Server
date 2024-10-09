import mongoose, { Document, Schema } from 'mongoose';
import { EnumNotification } from '../enums/schemaNotification.enum';

export interface INotification extends Document {
    title: string;
    content: string;
    isSeen: boolean;
    postedBy: mongoose.Types.ObjectId;
    postAt: Date;
    notificationType?: EnumNotification;
    postId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        content: {
            type: String,
        },
        isSeen: {
            type: Boolean,
            default: false,
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        postAt: {
            type: Date,
            default: Date.now,
        },
        notificationType: {
            type: String,
            enum: Object.values(EnumNotification),
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
        },
    },
    { timestamps: true },
);

export default mongoose.model<INotification>('Notification', notificationSchema);