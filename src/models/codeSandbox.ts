import mongoose, { Document, Schema } from 'mongoose';
import {
  CodeSandboxFileType,
  CodeSandboxLanguage,
  CodeSandboxStatus,
} from '../enums/codeSandbox.enum';
import { SCHEMA_CODE_SANDBOX } from '../enums/schemaCodeSandbox.enum';

interface ICodeSandboxMember {
  user: mongoose.Types.ObjectId;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
}

export interface ICodeSandbox extends Document {
  name: string;
  description: string;
  version: number;
  createdBy: mongoose.Types.ObjectId;
  members: ICodeSandboxMember[];
  updatedAt: Date;
  createdAt: Date;
  isPublic: boolean;
  language: CodeSandboxLanguage[];
  status: CodeSandboxStatus;
}

const CodeSandboxMemberSchema = new Schema<ICodeSandboxMember>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'viewer',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const CodeSandboxSchema = new Schema<ICodeSandbox>({
  [SCHEMA_CODE_SANDBOX.NAME]: {
    type: String,
    required: true,
    trim: true,
  },
  [SCHEMA_CODE_SANDBOX.DESCRIPTION]: {
    type: String,
    required: true,
    trim: true,
  },
  [SCHEMA_CODE_SANDBOX.VERSION]: {
    type: Number,
    default: 1,
  },
  [SCHEMA_CODE_SANDBOX.CREATED_BY]: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  [SCHEMA_CODE_SANDBOX.MEMBERS]: [CodeSandboxMemberSchema],
  [SCHEMA_CODE_SANDBOX.UPDATED_AT]: {
    type: Date,
    default: Date.now,
  },
  [SCHEMA_CODE_SANDBOX.CREATED_AT]: {
    type: Date,
    default: Date.now,
  },
  [SCHEMA_CODE_SANDBOX.IS_PUBLIC]: {
    type: Boolean,
    default: false,
  },
  [SCHEMA_CODE_SANDBOX.LANGUAGE]: {
    type: [String],
    enum: Object.values(CodeSandboxLanguage),
    required: true,
  },
  [SCHEMA_CODE_SANDBOX.STATUS]: {
    type: String,
    enum: Object.values(CodeSandboxStatus),
    default: CodeSandboxStatus.ACTIVE,
  },
});

// Update timestamps before saving
CodeSandboxSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const CodeSandbox = mongoose.model<ICodeSandbox>('CodeSandbox', CodeSandboxSchema);
