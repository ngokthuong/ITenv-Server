import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username?: string;
    dob?: Date;
    phoneNumber?: string;
    avatar?: string;
    gender?: number;
    status: number;
    lastOnline: Date
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
        type: Number
    },
    status: {
        type: Number
    },
    lastOnline: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
