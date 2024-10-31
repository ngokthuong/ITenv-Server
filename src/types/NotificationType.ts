import { NotificationTypeEnum } from '../enums/notification.enum';

export type NotificationRequestType = {
  notificationType?: NotificationTypeEnum;
  postId?: string;
  commentId?: string;
  content?: string;

  // problemId?: string;
};
