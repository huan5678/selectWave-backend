import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import session from 'express-session';
import { object, string, number } from 'yup';
import { ApiExcludeProps } from '@/types';
import { TokenBlacklist, User } from '@/models';
import { appError, handleErrorAsync, verifyToken } from '@/utils';

export const verifyAdminSchema = object({
  iat: number().required(),
  exp: number().required(),
  memberId: string().required(),
  email: string().optional(),
});

const secret = process.env.JWT_SECRET || 'select-wave';

const oneDay = 1000 * 60 * 60 * 24;

//session middleware
export const sessionMiddleware = session({
  secret,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false,
});

export const verifyMiddleware =
  (excludes: ApiExcludeProps[]) => async (req, res, next) => {
    const isExcluded = excludes.some(({ path, method }) =>
      req.originalUrl.startsWith(path) && (!method || req.method.toLowerCase() === method.toLowerCase())
    );
    if (isExcluded) {
      return next();
    }

    const token = req.headers.authorization?.split('Bearer ')[1]; // 提取 Token
    if (!token) {
      return res.status(401).send({ message: 'Invalid token', result: null });
    }

    // 檢查 Token 是否在黑名單中
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).send({ message: 'Token is blacklisted', result: null });
    }

    try {
      const decoded = verifyToken(token) as JwtPayload;
      if (!decoded.sub) {
        throw new Error('Invalid token payload');
      }
      const user = await User.findOne({ where: { id: decoded.sub } });
      req.user = user?.id ?? undefined;
      next();
    } catch (error: unknown) {
      return res.status(403).send({ message: `JWT error: ${(error as Error).message}`, result: null });
    }
  };

export const errorMiddleware = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).send({ message: `${error.name} ${error.message}`, result: null });
};


export const isAuthor = handleErrorAsync(async (req, _res: Response, next) => {
  const accessToken = req.header('Authorization')?.split('Bearer ').pop();
  if (!accessToken) {
    return appError({ code:401, message:'未帶入驗證碼，請重新登入！', next });
  }
  try {
    const decoded = verifyToken(accessToken);
    const currentUser = await User.findById(decoded.id).exec();
    req.user = currentUser;
    next();
  } catch (err) {
    return appError({ code:401, message: '驗證失敗，請重新登入！', next });
  }
});


