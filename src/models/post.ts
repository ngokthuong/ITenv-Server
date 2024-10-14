import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  postedBy: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  title: string;
  content: string;
  view: mongoose.Types.ObjectId[];
  vote: mongoose.Types.ObjectId[];
  commentBy: mongoose.Types.ObjectId[];
  categoryId: mongoose.Types.ObjectId[];
  isAnonymous: boolean;
  status: boolean;
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
    categoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      },
    ],
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