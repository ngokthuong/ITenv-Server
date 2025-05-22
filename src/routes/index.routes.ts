import authRouter from './account.routes';
import problemRouter from './problem.routes';
import userRouter from './user.routes';
import { Express } from 'express';
import { notFound, errHandler } from '../middlewares/handelError.mdw';
import postRouter from './post.routes';
import uploadRouter from './upload.routes';
import tagRouter from './tag.routes';
import commentRouter from './comment.routes';
import categoryRouter from './category.routes';
import friendRouter from './friend.routes';
import notificationRouter from './notification.routes';
import messsageRouter from './message.routes';
import conversationRouter from './conversation.routes';
import codeSandboxRouter from './codesanbox.routes';
import aiRouter from './ai.routes';
const initRoutes = (app: Express) => {
  // API
  app.use('/api/accounts', authRouter);
  app.use('/api/problems', problemRouter);
  app.use('/api/users', userRouter);
  app.use('/api/posts', postRouter);
  app.use('/api/storages', uploadRouter);
  app.use('/api/tags', tagRouter);
  app.use('/api/comments', commentRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/friends', friendRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/messages', messsageRouter);
  app.use('/api/conversations', conversationRouter);
  app.use('/api/codesandbox', codeSandboxRouter);
  app.use('/api/ai', aiRouter);

  //  ko tim dc api
  app.use(notFound);
  app.use(errHandler);
};

export default initRoutes;
