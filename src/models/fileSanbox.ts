import mongoose, { Document, Schema } from 'mongoose';
import { CodeSandboxFileType } from '../enums/codeSandbox.enum';

export interface ICodeSandboxFile extends Document {
  name: string;
  type: CodeSandboxFileType;
  code: string;
  version: number;
  sandboxId: mongoose.Types.ObjectId;
  parentFolder?: mongoose.Types.ObjectId | null;
  // Image specific fields
  isImage?: boolean;
  imageUrl?: string;
  imageSize?: number;
  imageMimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CodeSandboxFileSchema = new Schema<ICodeSandboxFile>({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(CodeSandboxFileType), required: true },
  code: { type: String, required: false },
  version: { type: Number, default: 1 },
  sandboxId: { type: Schema.Types.ObjectId, ref: 'CodeSandbox', required: true },
  parentFolder: { type: Schema.Types.ObjectId, ref: 'CodeSandboxFolder', default: null },
  // Image specific fields
  isImage: { type: Boolean, default: false },
  imageUrl: { type: String },
  imageSize: { type: Number },
  imageMimeType: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add index for faster queries
CodeSandboxFileSchema.index({ sandboxId: 1, parentFolder: 1 });
CodeSandboxFileSchema.index({ isImage: 1 });

export const CodeSandboxFile = mongoose.model<ICodeSandboxFile>(
  'CodeSandboxFile',
  CodeSandboxFileSchema,
);
