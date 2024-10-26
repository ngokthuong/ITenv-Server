import accountRouter from './auth.routes';
import problemRouter from './problem.routes';
import userRouter from './user.routes';
import { Express } from 'express';
import { notFound, errHandler } from '../middlewares/handelError.mdw';
import { logEvents } from '../helper/logEvents';
import postRouter from './post.routes';
import uploadRouter from './upload.routes';
import tagRouter from './tag.routes';
import commentRouter from './comment.routes';
import categoryRouter from './category.routes';
const initRoutes = (app: Express) => {
  // API
  app.use('/api/account', accountRouter);
  app.use('/api/problem', problemRouter);
  app.use('/api/user', userRouter);
  app.use('/api/post', postRouter);
  app.use('/api/storage/upload', uploadRouter);
  app.use('/api/tag', tagRouter);
  app.use('/api/comment', commentRouter);
  app.use('/api/category', categoryRouter);
  //  ko tim dc api
  app.use(notFound);
  app.use(errHandler);
};

export default initRoutes;
