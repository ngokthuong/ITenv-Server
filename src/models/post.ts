import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  postBy: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  title: string;
  content: string;
  view: mongoose.Types.ObjectId[];
  vote: mongoose.Types.ObjectId[];
  commentBy: mongoose.Types.ObjectId[];
  shareBy: mongoose.Types.ObjectId[];
  postAt: Date;
  editAt?: Date;
  isAnonymous: boolean;
  status: boolean;
}

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    postBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      },
    ],
    title: {
      type: String
    },
    content: {
      type: String
    },
    view: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    ],
    vote: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    ],
    commentBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    ],
    shareBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    ],
    postAt: {
      type: Date,
      default: Date.now,
    },
    editAt: {
      type: Date
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPost>('Post', postSchema);