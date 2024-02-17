import { NextFunction, Request, Router } from 'express';
import { Logger } from '@/utils';
import authRouter from './auth.router';
import imgurRouter from './imgur.router';
import memberRouter from './member.router';
import pollRouter from './poll.router';
import commentRouter from './comment.router';
import optionRouter from './option.router';


const apiRouter = Router();

apiRouter.use((req: Request, _, next: NextFunction) => {
  Logger.trace(
    `req ${req.path} query ${JSON.stringify(req.query)} ${ process.env.NODE_ENV === 'development' ? `body ${
      JSON.stringify(
        req.body,
      )}` : ''} ${JSON.stringify(req.params)} in api router`,
  );
  next();
});

apiRouter.use('/api/auth/', authRouter);
apiRouter.use('/api/imgur/', imgurRouter);
apiRouter.use('/api/member/', memberRouter);
apiRouter.use('/api/poll/', pollRouter);
apiRouter.use('/api/comment/', commentRouter);
apiRouter.use('/api/option/', optionRouter);

export default apiRouter;
