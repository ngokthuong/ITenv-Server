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
  status_code: number;
  status_runtime: string;
  memory: number;
  display_runtime?: string;
  code_answer: string[];
  code_output: string[];
  std_output_list: string[];
  expected_code_answer?: string[];
  expected_code_output?: string[];
  expected_std_output_list?: string[];
  correct_answer?: boolean;
  compare_result?: string;
  total_correct: number;
  total_testcases: number;
  status_memory: string;
  status_msg: string;
  state: string;
  compile_error?: string;
  full_compile_error?: string;
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
    status_code: {
      type: Number,
      required: true,
    },
    status_runtime: {
      type: String,
      required: true,
    },
    memory: {
      type: Number,
      required: true,
    },
    display_runtime: {
      type: String,
    },
    code_answer: [
      {
        type: String,
      },
    ],
    code_output: [
      {
        type: String,
      },
    ],
    std_output_list: [
      {
        type: String,
      },
    ],
    expected_code_answer: [
      {
        type: String,
      },
    ],
    expected_code_output: [
      {
        type: String,
      },
    ],
    expected_std_output_list: [
      {
        type: String,
      },
    ],
    correct_answer: {
      type: Boolean,
    },
    compare_result: {
      type: String,
    },
    total_correct: {
      type: Number,
      required: true,
    },
    total_testcases: {
      type: Number,
      required: true,
    },
    status_memory: {
      type: String,
      required: true,
    },
    status_msg: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    compile_error: {
      type: String,
    },
    full_compile_error: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
