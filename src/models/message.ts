import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  isSeenBy: mongoose.Types.ObjectId[];
  hasText: boolean;
  hasFile: boolean;
  hasCodeFile?: boolean;
  fileName?: string;
  content: string;
  fileUrl?: string[];
  isRecalled: boolean;
  isDeleted: boolean;
  parentMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  notificationMessage: boolean;
}

const messageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isSeenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hasText: {
      type: Boolean,
    },
    hasFile: {
      type: Boolean,
    },
    hasCodeFile: {
      type: Boolean,
      default: false,
    },
    fileName: {
      type: String,
      required: function () {
        return this.hasCodeFile;
      },
    },
    content: {
      type: String,
      required: function () {
        return this.hasText;
      },
    },
    fileUrl: [
      {
        type: String,
        default: '',
      },
    ],
    isRecalled: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: false,
    },
    notificationMessage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IMessage>('Message', messageSchema);
