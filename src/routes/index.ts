import { NextFunction, Request, Router } from 'express';
import { Logger } from '@/utils';
import authRouter from './auth.router';
import imgurRouter from './imgur.router';
import memberRouter from './member.router';
import pollRouter from './poll.router';
import commentRouter from './comment.router';
import optionRouter from './option.router';


const apiRouter = Router();

apiRouter.use((req, _, next: NextFunction) => {
  Logger.trace(
    `req ${req.path} query ${JSON.stringify(req.query)} body ${JSON.stringify(
      req.body,
    )} in api router`,
  );
  next();
});



apiRouter.get('/', (req, res) => {
    const healthCheck = {
        status: true,
        message: 'OK',
        uptime: process.uptime(),
        timestamp: Date.now(),
        host: req.headers.host
    };
    res.send(healthCheck);
})

apiRouter.use('/api/auth/', authRouter);
apiRouter.use('/api/imgur/', imgurRouter);
apiRouter.use('/api/member/', memberRouter);
apiRouter.use('/api/poll/', pollRouter);
apiRouter.use('/api/comment/', commentRouter);
apiRouter.use('/api/option/', optionRouter);

export default apiRouter;
