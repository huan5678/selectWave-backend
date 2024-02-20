import { NextFunction, Request, Router } from 'express';
import { Logger } from '@/utils';
import authRouter from './auth.router';
import imgurRouter from './imgur.router';
import memberRouter from './member.router';
import pollRouter from './poll.router';
import commentRouter from './comment.router';
import optionRouter from './option.router';
import mailRouter from './mail.router';
import contactRouter from './contact.router';

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


apiRouter.use('/auth', authRouter);
apiRouter.use('/imgur', imgurRouter);
apiRouter.use('/member', memberRouter);
apiRouter.use('/poll', pollRouter);
apiRouter.use('/comment', commentRouter);
apiRouter.use('/option', optionRouter);
apiRouter.use('/mail', mailRouter);
apiRouter.use('/contact', contactRouter);

export default apiRouter;
