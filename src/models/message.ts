import mongoose, { Document, Schema } from 'mongoose';
import { EnumMessage } from '../enums/schemaMessage.enum';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  isSeenBy: mongoose.Types.ObjectId[];
  hasText: boolean;
  hasFile: boolean;
  content: string;
  fileUrl?: string[];
  isRecalled: boolean;
  isDeleted: boolean;
  parentMessage?: mongoose.Types.ObjectId;
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
  },
  { timestamps: true },
);

export default mongoose.model<IMessage>('Message', messageSchema);
