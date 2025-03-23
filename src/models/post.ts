import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  postedBy?: mongoose.Types.ObjectId;
  vote: mongoose.Types.ObjectId[];
  view: mongoose.Types.ObjectId[];
  isAnonymous: boolean;
  resolve: boolean;
  content: string;
  tags: mongoose.Types.ObjectId[];
  downVote: mongoose.Types.ObjectId[];
  title: string;
  categoryId: mongoose.Types.ObjectId[];
  isBlocked: boolean;
  isDeleted: boolean;
  report: {
    reportedBy: mongoose.Types.ObjectId;
    reason: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    view: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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
    categoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    resolve: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    report: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IPost>('Post', postSchema);
