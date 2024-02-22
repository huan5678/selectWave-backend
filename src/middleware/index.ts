import type { NextFunction, Response, Request } from "express";
import session from "express-session";
import { object, string, number } from "yup";
import { Server, WebSocketServer } from 'ws';

import { ApiExcludeProps, TokenPayload } from "@/types";
import { TokenBlacklist, User } from "@/models";
import { appError, getToken, handleErrorAsync, verifyToken } from "@/utils";

export const verifyAdminSchema = object({
  iat: number().required(),
  exp: number().required(),
  memberId: string().required(),
  email: string().optional(),
});

const secret = process.env.JWT_SECRET || "select-wave";

const oneDay = 1000 * 60 * 60 * 24;

//session middleware
export const sessionMiddleware = session({
  secret,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false,
});

export const verifyMiddleware =
  (excludes: ApiExcludeProps[]) =>
  async (req, res: Response, next: NextFunction) => {
    try {
      const isExcluded = excludes.some(
        ({ path, method }) => req.path === path && // 修改這裡進行完全匹配檢查
            (!method || req.method.toLowerCase() === method.toLowerCase())
      );
      if (isExcluded) {
        return next();
      }
      return isAuthor(req, res, next);
    } catch (error: unknown) {
      throw appError({
        code: 403,
        message: `JWT error: ${(error as Error).message}`,
        next,
      });
    }
  };

export const isAuthor = handleErrorAsync(
  async (req, _res: Response, next: NextFunction) => {
    const token = getToken(req); // 提取 Token
    if (!token) {
      throw appError({ code: 401, message: "請先登入", next });
    }
    try {
      // 檢查 Token 是否在黑名單中
      const isBlacklisted = await TokenBlacklist.findOne({ token });
      if (isBlacklisted) {
        throw appError({ code: 401, message: "Token 已經過期或無效", next });
      }

      const decoded = verifyToken(token) as TokenPayload;
      const { userId, exp } = decoded;
      if (!userId) {
        throw appError({ code: 401, message: "驗證失敗，請重新登入！", next });
      }
      if (!exp || exp < Date.now().valueOf() / 1000) {
        await TokenBlacklist.create({ token });
        throw appError({
          code: 401,
          message: "驗證碼已過期，請重新登入！",
          next,
        });
      }
      const currentUser = await User.findById(userId).exec();
      if (!currentUser) {
        throw appError({ code: 404, message: "無此使用者", next });
      }
      req.user = currentUser;
      next();
    } catch (err) {
      throw appError({ code: 401, message: "驗證失敗，請重新登入！", next });
    }
  }
);

export const attachWsToRequest = (wss: WebSocketServer) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.wss = wss;
    next();
  };
};

export const initWebSocketServer = (server: any): WebSocketServer => {
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
  return wss;
};

