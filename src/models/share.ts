import mongoose, { Document, Schema } from 'mongoose';

interface IShare extends Document {
  _id: mongoose.Types.ObjectId;
  sharedBy: mongoose.Types.ObjectId;
  sharedToUser: mongoose.Types.ObjectId;
  sharedToCvstion: mongoose.Types.ObjectId;
  shareToMyProfile: boolean;
  postId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShareSchema: Schema<IShare> = new Schema(
  {
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharedToUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sharedToCvstion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    shareToMyProfile: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IShare>('Share', ShareSchema);
