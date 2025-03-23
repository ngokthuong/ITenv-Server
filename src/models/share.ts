import mongoose, { Document, Schema } from 'mongoose';

enum ShareTarget {
  USER = 'USER',
  CONVERSATION = 'CONVERSATION',
  MY_PROFILE = 'MY_PROFILE',
}

interface IShare extends Document {
  _id: mongoose.Types.ObjectId;
  sharedBy: mongoose.Types.ObjectId;
  shareTo: ShareTarget;
  targetId?: mongoose.Types.ObjectId; // Chỉ có nếu shareTo là USER hoặc CONVERSATION
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
    shareTo: {
      type: String,
      enum: Object.values(ShareTarget),
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'shareTo', // Tham chiếu động dựa trên `shareTo`
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
