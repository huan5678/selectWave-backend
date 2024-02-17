import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import Routes from '@/routes';
import * as Exception from '@/app/exception';
import { sessionMiddleware, verifyMiddleware } from '@/middleware';
import swaggerRouter from '@/routes/swagger.router';

const app = express();

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));

app.use(swaggerRouter);
app.use(
  '/',
  verifyMiddleware(
    [
      { path: '/api/auth/login', method: 'POST' },
      { path: '/api/auth/register', method: 'POST' },
      { path: '/api/auth/reset-password', method: 'PUT' },
      { path: '/api/auth/verify', method: 'GET' },
      { path: '/api/auth/verify', method: 'POST' },
      { path: '/api/member', method: 'GET' },
      { path: '/api/comment', method: 'GET' },
      { path: '/api/option', method: 'GET' },
      { path: '/api/poll', method: 'GET' },
  ]),
  Routes,
);

app.use(Exception.sendNotFoundError);
app.use(Exception.catchCustomError);

Exception.catchGlobalError();

export default app;
