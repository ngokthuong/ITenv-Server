import mongoose, { Document, Schema } from "mongoose";
import { EnumGengerUser } from '../enums/schemaUser.enum'
import { boolean, string } from "joi";
interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username?: string;
    dob?: Date;
    phoneNumber?: string;
    avatar?: string;
    gender?: EnumGengerUser;
    status: Boolean;
    lastOnline: Date;
    followerId: mongoose.Types.ObjectId;
    notifications: mongoose.Types.ObjectId;
    conversations: mongoose.Types.ObjectId;
    submitProblems: mongoose.Types.ObjectId;
    acceptedProblems: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String
    },
    dob: {
        type: Date
    },
    phoneNumber: {
        type: String
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dcti265mg/image/upload/v1725036493/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper_xa2b6h.png"
    },
    gender: {
        type: String,
        enum: Object.values(EnumGengerUser)
    },
    status: {
        type: Boolean,
    },
    lastOnline: {
        type: Date
    },
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notifications: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    },
    conversations: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    submitProblems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    },
    acceptedProblems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
