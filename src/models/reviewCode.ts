import mongoose, { Document, Schema } from 'mongoose';

export interface IReviewCode extends Document {
  submitBy: mongoose.Types.ObjectId;
  problem: mongoose.Types.ObjectId;
  code: {
    language: string;
    content: string;
  };
  overallScore: number;
  feedback: string;
  suggestions: string[];
  bestPractices: string[];
  complexityAnalysis: {
    timeComplexity: string;
    spaceComplexity: string;
    bigONotation: string;
  };
  memoryUsage: {
    estimatedMemory: string;
    potentialMemoryIssues: string[];
  };
  algorithmSuitability: {
    isOptimal: boolean;
    alternativeApproaches: string[];
    reasoning: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const ReviewCodeSchema = new Schema<IReviewCode>(
  {
    submitBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problem: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    code: {
      language: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
    overallScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    feedback: {
      type: String,
      required: true,
    },
    suggestions: [
      {
        type: String,
      },
    ],
    bestPractices: [
      {
        type: String,
      },
    ],
    complexityAnalysis: {
      timeComplexity: {
        type: String,
        required: true,
      },
      spaceComplexity: {
        type: String,
        required: true,
      },
      bigONotation: {
        type: String,
        required: true,
      },
    },
    memoryUsage: {
      estimatedMemory: {
        type: String,
        required: true,
      },
      potentialMemoryIssues: [
        {
          type: String,
        },
      ],
    },
    algorithmSuitability: {
      isOptimal: {
        type: Boolean,
        required: true,
      },
      alternativeApproaches: [
        {
          type: String,
        },
      ],
      reasoning: {
        type: String,
        required: true,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for better query performance
ReviewCodeSchema.index({ submitBy: 1, problem: 1 });
ReviewCodeSchema.index({ createdAt: -1 });
ReviewCodeSchema.index({ isDeleted: 1 });

const ReviewCode = mongoose.model<IReviewCode>('ReviewCode', ReviewCodeSchema);

export default ReviewCode;
