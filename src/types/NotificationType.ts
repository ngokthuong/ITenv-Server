import { NotificationTypeEnum } from '../enums/notification.enum';

export type NotificationRequestType = {
  notificationType?: NotificationTypeEnum;
  postId?: string;
  commentId?: string;
  content?: string;
  relationshipId?: string;
  title?: string;
  receiverId?: string[];
  // problemId?: string;
};
