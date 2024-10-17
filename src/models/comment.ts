import mongoose, { Document, Schema } from 'mongoose';

interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  commentBy: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  isAccepted: boolean;
  vote: mongoose.Types.ObjectId[];
  content: string;
  notificationId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
}

const commentSchema: Schema<IComment> = new mongoose.Schema(
  {
    commentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vote: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    content: {
      type: String,
      required: true,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
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

export default mongoose.model<IComment>('Comment', commentSchema);
