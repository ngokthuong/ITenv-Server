import mongoose, { Document, Schema } from 'mongoose';
import { EnumGenderUser } from '../enums/schemaUser.enum';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username?: string;
  dob?: Date;
  phoneNumber?: string;
  avatar?: string;
  gender?: EnumGenderUser;
  status: boolean;
  lastOnline: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  blocker: mongoose.Types.ObjectId[];
  savedPost: mongoose.Types.ObjectId[];
  problemPoint: number;
  socialPoint: number;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/dcti265mg/image/upload/v1728960991/453178253_471506465671661_2781666950760530985_n.png_ewlm3k.png',
    },
    gender: {
      type: String,
      enum: Object.values(EnumGenderUser),
    },
    status: {
      type: Boolean,
      default: true,
    },
    lastOnline: {
      type: Date,
      default: Date.now,
    },
    blocker: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savedPost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    problemPoint: {
      type: Number,
      default: 0,
      min: 0,
    },
    socialPoint: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>('User', userSchema);
