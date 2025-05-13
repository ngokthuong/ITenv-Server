import mongoose, { Document, Schema } from 'mongoose';

export interface ICodeSandboxFolder extends Document {
  name: string;
  sandboxId: mongoose.Types.ObjectId;
  parentFolder?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CodeSandboxFolderSchema = new Schema<ICodeSandboxFolder>({
  name: { type: String, required: true, trim: true },
  sandboxId: { type: Schema.Types.ObjectId, ref: 'CodeSandbox', required: true },
  parentFolder: { type: Schema.Types.ObjectId, ref: 'CodeSandboxFolder', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CodeSandboxFolder = mongoose.model<ICodeSandboxFolder>(
  'CodeSandboxFolder',
  CodeSandboxFolderSchema,
);
