import mongoose, { Document, Schema } from 'mongoose';

interface IInitialCode {
  lang?: string;
  langSlug?: string;
  code?: string;
}

interface ITestCase {
  input: {
    name: string;
    value: string;
  }[];
  output: string[];
}

export interface IProblem extends Document {
  title: string;
  slug: string;
  content: string;
  level: string;
  tags: string[];
  acceptance?: mongoose.Types.ObjectId[];
  submitBy?: mongoose.Types.ObjectId[];
  hint: string[];
  initialCode: IInitialCode[];
  testCase?: ITestCase;
  vote?: number;
  comment?: mongoose.Types.ObjectId[];
  postAt: Date;
  editAt?: Date;
  status: boolean;
}

const initialCodeSchema: Schema<IInitialCode> = new mongoose.Schema({
  lang: {
    type: String,
    required: true,
  },
  langSlug: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: false,
  },
});

const testCaseSchema: Schema<ITestCase> = new mongoose.Schema({
  input: [
    {
      name: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
  output: {
    type: [String],
    required: true,
  },
});

const problemSchema: Schema<IProblem> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    level: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    acceptance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    submitBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hint: {
      type: [String],
    },
    initialCode: [
      {
        type: initialCodeSchema,
        required: false,
      },
    ],
    testCase: {
      type: testCaseSchema,
      required: false,
    },
    vote: {
      type: Number,
      default: 0,
    },
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
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IProblem>('Problem', problemSchema);
