import mongoose, { Document, Schema } from 'mongoose';

interface ICode {
  language: string;
  content: string;
}

export interface ISubmission extends Document {
  submitBy: mongoose.Types.ObjectId;
  problem: mongoose.Types.ObjectId;
  code: ICode;
  score: number;
  isAccepted: boolean;
  submissionLeetcodeId?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const codeSchema: Schema<ICode> = new Schema({
  language: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const submissionSchema: Schema<ISubmission> = new Schema(
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
    code: {
      type: codeSchema,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    submissionLeetcodeId: {
      type: String,
      unique: true,
      sparse: true, // Cho phép giá trị null mà vẫn đảm bảo unique
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
