import accountRouter from './auth.routes';
import problemRouter from './problem.routes';
import userRouter from './user.routes';
import { Express } from 'express';
import { notFound, errHandler } from '../middleware/handelError.mdw';

const initRoutes = (app: Express) => {
  // API
  app.use('/api/account', accountRouter);
  app.use('/api/problem', problemRouter);
  app.use('/api/user', userRouter);
  //  ko tim dc api
  app.use(notFound);
  app.use(errHandler);
};

export default initRoutes;
