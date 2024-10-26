import mongoose, { Document, Schema } from 'mongoose';
import { EnumNotification } from '../enums/schemaNotification.enum';

export interface INotification extends Document {
    postedBy: mongoose.Types.ObjectId;
    title: string;
    content: string;
    isSeen: boolean;
    notificationType?: EnumNotification;
    postId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    comment: mongoose.Types.ObjectId;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
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
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    },
    { timestamps: true },
);

export default mongoose.model<INotification>('Notification', notificationSchema);