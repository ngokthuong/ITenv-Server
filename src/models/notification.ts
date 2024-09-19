import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
    title: string;
    content: string;
    isSeen: boolean;
    postedBy: mongoose.Types.ObjectId;
    postAt: Date;
    notificationType?: string;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isSeen: {
        type: Boolean,
        default: false
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postAt: {
        type: Date,
        default: Date.now
    },
    notificationType: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', notificationSchema);
