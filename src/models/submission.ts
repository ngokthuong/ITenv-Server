import mongoose, { Document, Schema } from 'mongoose';

interface ICode {
  language: string;
  content: string;
}

export interface ISubmission extends Document {
  submitBy: mongoose.Types.ObjectId;
  problem: mongoose.Types.ObjectId;
  // code: ICode;
  // score: number;
  isAccepted: boolean;
  submissionLeetcodeId: string;
  submitAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const codeSchema: Schema<ICode> = new mongoose.Schema({
  language: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
});

const submissionSchema: Schema<ISubmission> = new mongoose.Schema(
  {
    submitBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    // code: {
    //     type: codeSchema,
    //     required: true
    // },
    // score: {
    //     type: Number
    // },
    isAccepted: {
      type: Boolean,
    },
    submissionLeetcodeId: {
      type: String,
    },
    submitAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
