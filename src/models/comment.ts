import mongoose, { Document, Schema } from 'mongoose';

interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  commentBy: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  isAccepted: boolean;
  vote: mongoose.Types.ObjectId[];
  downVote: mongoose.Types.ObjectId[];
  content: string;
  postId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  children?: IComment[];
  resolve: boolean,
  isDeleted: boolean
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
    downVote: [
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
      ref: 'Comment'
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
    },
    children: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    resolve: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true },
);

export default mongoose.model<IComment>('Comment', commentSchema);
