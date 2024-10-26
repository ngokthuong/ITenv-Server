import mongoose, { Document, Schema } from 'mongoose';
import { EnumLevelProblem } from '../enums/schemaProblem.enum';

interface IInitialCode {
  lang: string;
  langSlug: string;
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
  level: EnumLevelProblem;
  tags: mongoose.Types.ObjectId[];
  acceptance?: mongoose.Types.ObjectId[];
  submitBy?: mongoose.Types.ObjectId[];
  hint: string[];
  initialCode: IInitialCode[];
  testCase?: ITestCase;
  vote: mongoose.Types.ObjectId[];
  downVote: mongoose.Types.ObjectId[];
  postAt: Date;
  editAt?: Date;
  status: boolean;
  category?: mongoose.Types.ObjectId[];
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
      enum: Object.values(EnumLevelProblem),
      required: true,
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Tag',
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
      required: false,
    },
    initialCode: [initialCodeSchema],
    testCase: testCaseSchema,
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
    postAt: {
      type: Date,
      default: Date.now,
    },
    editAt: {
      type: Date,
      default: null,
    },
    status: {
      type: Boolean,
      required: true,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IProblem>('Problem', problemSchema);
