import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import Routes from '@/routes';
import * as Exception from '@/app/exception';
import { sessionMiddleware, verifyMiddleware } from '@/middleware';
import swaggerRouter from '@/routes/swagger.router';
import { thirdPartyAuthService } from '@/services';

const app = express();

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));
thirdPartyAuthService.initialize();
app.use(swaggerRouter);

app.use(
  '/api',
  verifyMiddleware(
    [
      { path: '/auth/login', method: 'POST' },
      { path: '/auth/register', method: 'POST' },
      { path: '/auth/reset-password', method: 'POST' },
      { path: '/auth/reset-password', method: 'PUT' },
      { path: '/auth/verify', method: 'GET' },
      { path: '/auth/verify', method: 'POST' },
      { path: '/auth/google', method: 'GET' },
      { path: '/auth/google/callback', method: 'GET' },
      { path: '/auth/facebook', method: 'GET' },
      { path: '/auth/facebook/callback', method: 'GET' },
      { path: '/auth/line', method: 'GET' },
      { path: '/auth/line/callback', method: 'GET' },
      { path: '/auth/discord', method: 'GET' },
      { path: '/auth/discord/callback', method: 'GET' },
      { path: '/auth/github', method: 'GET' },
      { path: '/auth/github/callback', method: 'GET' },
      { path: '/member/', method: 'GET' },
      { path: '/comment/', method: 'GET' },
      { path: '/option/', method: 'GET' },
      { path: '/poll/', method: 'GET' },
      { path: '/mail/contact', method: 'POST' },
      { path: '/contact/', method: 'POST' },
      { path: '/contact/subscribe', method: 'POST' },
      { path: '/contact/subscribe', method: 'PUT' },
  ]),
  Routes,
);

app.use(Exception.sendNotFoundError);
app.use(Exception.catchCustomError);

export default app;
