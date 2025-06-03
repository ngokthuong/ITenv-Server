import { Socket } from 'socket.io';
import { NotificationTypeEnum } from '../enums/notification.enum';
import notification from '../models/notification';
import post from '../models/post';
import { IUser } from '../models/user';
import { NotificationRequestType } from '../types/NotificationType';
import comment from '../models/comment';
import friend from '../models/friend';

export const notifySocket = async (
  socket: Socket,
  user: IUser,
  notificationReq: NotificationRequestType,
) => {
  try {
    let newNotification;

    switch (notificationReq.notificationType) {
      case NotificationTypeEnum.VOTE_POST:
      case NotificationTypeEnum.DOWNVOTE_POST:
      case NotificationTypeEnum.SHARE_POST: {
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

          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;
      }
      case NotificationTypeEnum.VOTE_COMMENT:
      case NotificationTypeEnum.DOWNVOTE_COMMENT: {
        const getComment = await comment.findById(notificationReq.commentId);
        if (getComment) {
          const commentedBy = getComment.commentedBy;
          newNotification = new notification({
            postedBy: user._id,
            notificationType: notificationReq.notificationType,
            postId: notificationReq.postId,
            commentId: notificationReq.commentId,
            receivers: [commentedBy],
            content: `<strong>${user.username}</strong> ${
              notificationReq.notificationType === NotificationTypeEnum.VOTE_COMMENT
                ? 'voted'
                : 'downvoted'
            } on your comment.`,
          });
          await newNotification.save();

          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;
      }
      case NotificationTypeEnum.COMMENT_POST: {
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

          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;
      }
      case NotificationTypeEnum.REP_COMMENT: {
        const getCommentToReply = await comment.findById(notificationReq.commentId);
        if (getCommentToReply) {
          const commentOwner = getCommentToReply.commentedBy;
          newNotification = new notification({
            postedBy: user._id,
            notificationType: NotificationTypeEnum.REP_COMMENT,
            postId: notificationReq.postId,
            commentId: notificationReq.commentId,
            receivers: [commentOwner],
            content: `<strong>${user.username}</strong> replied to your comment: "${notificationReq.content}"`,
          });
          await newNotification.save();

          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
        break;
      }
      case NotificationTypeEnum.ACCEPT_FRIEND_REQUEST:
      case NotificationTypeEnum.REJECT_FRIEND_REQUEST: {
        if (!notificationReq?.relationshipId) return;
        const relationship = await friend.findById(notificationReq?.relationshipId);
        if (!relationship) return;
        newNotification = new notification({
          postedBy: user._id,
          notificationType: notificationReq.notificationType,
          receivers:
            relationship.sentBy === user._id ? [relationship.receiver] : [relationship.sentBy],
          content: `<strong>${user.username}</strong> <span> ${
            notificationReq.notificationType === NotificationTypeEnum.ACCEPT_FRIEND_REQUEST
              ? 'accepted'
              : 'rejected'
          } your friend request</span>`,
        });

        await newNotification.save();
        for (const receiverId of newNotification.receivers) {
          socket.to(receiverId.toString()).emit('receive_notification_friend', newNotification);
        }
        break;
      }
      case NotificationTypeEnum.ADMIN_NOTIFICATION: {
        newNotification = new notification({
          postedBy: user._id,
          notificationType: notificationReq.notificationType,
          content: `<strong>${notificationReq.title}</strong> <br> ${notificationReq.content}`,
          receivers: !notificationReq.receiverId?.includes('ALL')
            ? notificationReq.receiverId
            : null,
          isGlobal: notificationReq.receiverId?.includes('ALL'),
        });
        await newNotification.save();
        if (notificationReq?.receiverId?.includes('ALL')) {
          socket.broadcast.emit('receive_notification', newNotification);
        } else {
          for (const receiverId of newNotification.receivers) {
            socket.to(receiverId.toString()).emit('receive_notification', newNotification);
          }
        }
      }
      default:
        console.error('Unknown notification type');
        break;
    }
  } catch (error) {
    console.error('Error handling notification:', error);
  }
};
