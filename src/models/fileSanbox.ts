import mongoose, { Document, Schema } from 'mongoose';
import { CodeSandboxFileType } from '../enums/codeSandbox.enum';

export interface ICodeSandboxFile extends Document {
  name: string;
  type: CodeSandboxFileType;
  code: string;
  version: number;
  sandboxId: mongoose.Types.ObjectId;
  parentFolder?: mongoose.Types.ObjectId | null;
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CodeSandboxFile = mongoose.model<ICodeSandboxFile>(
  'CodeSandboxFile',
  CodeSandboxFileSchema,
);
