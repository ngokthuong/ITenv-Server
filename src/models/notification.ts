import mongoose, { Document, Schema } from 'mongoose';
import { NotificationTypeEnum } from '../enums/notification.enum';

export interface INotification extends Document {
  postedBy: mongoose.Types.ObjectId;
  title: string;
  content: string;
  isSeen: boolean;
  notificationType?: NotificationTypeEnum;
  postId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
  message: mongoose.Types.ObjectId;
  receivers: mongoose.Types.ObjectId[];
  isDeleted: boolean;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    notificationType: {
      type: String,
      enum: Object.values(NotificationTypeEnum),
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      //   required: function () {
      //     return (
      //       this.notificationType === NotificationTypeEnum.VOTE_POST ||
      //       this.notificationType === NotificationTypeEnum.DOWNVOTE_POST ||
      //       this.notificationType === NotificationTypeEnum.SHARE_POST ||
      //       this.notificationType === NotificationTypeEnum.COMMENT_POST ||
      //       this.notificationType === NotificationTypeEnum.REP_COMMENT
      //     );
      //   },
    },
    message: {
      type: mongoose.Schema.Types.ObjectId
    },
    receivers: [mongoose.Schema.Types.ObjectId],

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true },
);

export default mongoose.model<INotification>('Notification', notificationSchema);
