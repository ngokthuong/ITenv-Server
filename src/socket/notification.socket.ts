import { Socket } from 'socket.io';
import { NotificationTypeEnum } from '../enums/notification.enum';
import notification from '../models/notification';
import post from '../models/post';
import user, { IUser } from '../models/user';
import { NotificationRequestType } from '../types/NotificationType';
import comment from '../models/comment';

export const notifySocket = async (
  socket: Socket,
  user: IUser,
  notificationReq: NotificationRequestType,
) => {
  try {
    console.log('notification socket');
    let newNotification;

    switch (notificationReq.notificationType) {
      case NotificationTypeEnum.VOTE_POST:
      case NotificationTypeEnum.DOWNVOTE_POST:
      case NotificationTypeEnum.SHARE_POST:
        const getPost = await post.findById(notificationReq.postId);
        if (getPost) {
          const postById = getPost.postedBy;
          newNotification = new notification({
            postedBy: user._id,
            notificationType: notificationReq.notificationType,
            postId: notificationReq.postId,
            receivers: [postById], // Array of user IDs to notify
            content: `<strong>${user.username}</strong> ${
              notificationReq.notificationType === NotificationTypeEnum.VOTE_POST
                ? 'voted'
                : notificationReq.notificationType === NotificationTypeEnum.DOWNVOTE_POST
                ? 'downvoted'
                : 'shared'
            } on your post.`,
          });
          await newNotification.save();

          // Emit to all receivers
          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;

      case NotificationTypeEnum.VOTE_COMMENT:
      case NotificationTypeEnum.DOWNVOTE_COMMENT:
        const getComment = await comment.findById(notificationReq.commentId);
        if (getComment) {
          const commentBy = getComment.commentBy;
          newNotification = new notification({
            postedBy: user._id,
            notificationType: notificationReq.notificationType,
            postId: notificationReq.postId,
            commentId: notificationReq.commentId,
            receivers: [commentBy],
            content: `<strong>${user.username}</strong> ${
              notificationReq.notificationType === NotificationTypeEnum.VOTE_COMMENT
                ? 'voted'
                : 'downvoted'
            } on your comment.`,
          });
          await newNotification.save();

          // Emit to all receivers
          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;

      case NotificationTypeEnum.COMMENT_POST:
        const postForComment = await post.findById(notificationReq.postId);
        if (postForComment) {
          const postOwner = postForComment.postedBy;
          newNotification = new notification({
            postedBy: user._id,
            notificationType: NotificationTypeEnum.COMMENT_POST,
            postId: notificationReq.postId,
            receivers: [postOwner],
            content: `<strong>${user.username}</strong> commented on your post: "${notificationReq.content}"`,
          });
          await newNotification.save();

          // Emit to all receivers
          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;

      case NotificationTypeEnum.REP_COMMENT:
        const getCommentToReply = await comment.findById(notificationReq.commentId);
        if (getCommentToReply) {
          const commentOwner = getCommentToReply.commentBy;
          newNotification = new notification({
            postedBy: user._id,
            notificationType: NotificationTypeEnum.REP_COMMENT,
            postId: notificationReq.postId,
            commentId: notificationReq.commentId,
            receivers: [commentOwner],
            content: `<strong>${user.username}</strong> replied to your comment: "${notificationReq.content}"`,
          });
          await newNotification.save();

          // Emit to all receivers
          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;

      default:
        console.error('Unknown notification type');
    }
  } catch (error) {
    console.error('Error handling notification:', error);
  }
};
