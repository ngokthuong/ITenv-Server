import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  isGroupChat?: boolean;
  groupName?: string;
  isDeleted?: boolean;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  admin?: mongoose.Types.ObjectId;
  groupAvatar?: string;
}

const conversationSchema: Schema<IConversation> = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      validate: {
        validator: function (value: string) {
          return !this.isGroupChat || (this.isGroupChat && value != null);
        },
        message: 'Group Name is required for group chats',
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: IConversation) {
        return this.isGroupChat;
      },
      default: function (this: IConversation) {
        return this.isGroupChat ? this.createdBy : undefined;
      },
    },
    groupAvatar: {
      type: String,
      validate: {
        validator: function (value: string) {
          return !this.isGroupChat || (this.isGroupChat && value != null);
        },
        message: 'Group Photo is required for group chats',
      },
    },
  },
  { timestamps: true },
);

// conversationSchema.path('participants').validate(function (value) {
//     return value.length >= 3;
// }, 'A conversation must have at least 3 participants.');

export default mongoose.model<IConversation>('Conversation', conversationSchema);
