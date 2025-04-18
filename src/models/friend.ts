import mongoose, { Document, Schema } from 'mongoose';
import { EnumFriend } from '../enums/schemaFriend.enum';

export interface IFriend extends Document {
  sentBy: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: EnumFriend;
  isBlockBy: mongoose.Types.ObjectId;
  acceptedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const friendSchema: Schema<IFriend> = new mongoose.Schema(
  {
    sentBy: {
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export default mongoose.model<IFriend>('Friend', friendSchema);
