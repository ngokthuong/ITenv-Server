import mongoose, { Document, Schema } from "mongoose";
import accountSchema from "./account";
import { number } from "joi";

// Define interfaces for the documents
interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    account: mongoose.Types.ObjectId[];
    username?: string;
    dob?: Date;
    phoneNumber?: string;
    avatar?: string;
    posts: mongoose.Schema.Types.ObjectId[];
    notifications: mongoose.Schema.Types.ObjectId[];
    submissions: mongoose.Schema.Types.ObjectId[];
    refreshToken: string;
    gender?: number;
    status: number;
    lastOnline: Date
}

// Define the schema
const userSchema = new Schema<IUser>({
    account: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    }],
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
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
    }],
    refreshToken: {
        type: String
    },
    gender: {
        type: Number
    },
    status: {
        type: Number
    },
    lastOnline: {
        type: Date
    }
}, { timestamps: true });

// Export the model
const User = mongoose.model<IUser>('User', userSchema);

export default User;