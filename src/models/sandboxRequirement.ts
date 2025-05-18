import mongoose, { Document, Schema } from 'mongoose';

export type SandboxRequirementRole = 'owner' | 'editor' | 'viewer';

export interface ISandboxRequirement extends Document {
  sandbox: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  requestedRole: SandboxRequirementRole;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sandboxRequirementSchema = new Schema<ISandboxRequirement>(
  {
    sandbox: {
      type: Schema.Types.ObjectId,
      ref: 'CodeSandbox',
      required: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedRole: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
sandboxRequirementSchema.index({ sandbox: 1, requester: 1 }, { unique: true });

export const SandboxRequirement = mongoose.model<ISandboxRequirement>(
  'SandboxRequirement',
  sandboxRequirementSchema,
);
