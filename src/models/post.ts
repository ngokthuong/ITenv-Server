import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  postBy: mongoose.Types.ObjectId;
  title: string;
  content: string;
  view: mongoose.Types.ObjectId;
  vote: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId[];
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
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    view: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    vote: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    comment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    postAt: {
      type: Date,
      default: Date.now,
    },
    editAt: {
      type: Date,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPost>('Post', postSchema);
