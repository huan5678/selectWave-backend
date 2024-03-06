import { NextFunction, Request, Response } from 'express';
import { EventEmitter } from 'events';
import jsonWebToken, { type JwtPayload } from 'jsonwebtoken';
import { Schema, date as dateSchema, object } from 'yup';
import { Data, ResponseError } from '@/types';

const { JWT_SECRET, JWT_EXPIRES_DAY } = process.env;

export const generateToken = (payload: { userId?: string }) => {
  return jsonWebToken.sign(payload, JWT_SECRET as unknown as string, {
    expiresIn: JWT_EXPIRES_DAY,
  });
};

export const getToken = (req: Request) =>
{
  const token = req.header('Authorization')?.split('Bearer ').pop();
  return token;
};

export const verifyToken = (token: string) => {
  try {
    return jsonWebToken.verify(token, JWT_SECRET as unknown as string) as JwtPayload;
  } catch (error) {
    throw appError({
      code: 403,
      message: '驗證失敗，請重新登入！',
    });
  }
};

const generateRandomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
};

export const generateEmailToken = () => {
  const code = generateRandomCode();

  const token = jsonWebToken.sign({ code }, JWT_SECRET as unknown as string, {
    expiresIn: 3600,
  });

  return { code, token };
};

export const LogLevel = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as const;
export class Logger {
  static fatal(message: string | Error) {
    Logger.log(message, 'FATAL');
  }
  static error(message: string | Error) {
    Logger.log(message, 'ERROR');
  }
  static warn(message: string | Error) {
    Logger.log(message, 'WARN');
  }
  static info(message: string | Error) {
    Logger.log(message, 'INFO');
  }
  static debug(message: string | Error) {
    Logger.log(message, 'DEBUG');
  }
  static trace(message: string | Error) {
    Logger.log(message, 'TRACE');
  }
  static log(message: string | Error, level: (typeof LogLevel)[number] = 'INFO') {
    const now: Date = new Date();
    const formatTime = `${now.toLocaleDateString('zh-TW', {timeZone: 'Asia/Taipei'})} ${now.toLocaleTimeString('zh-TW', {timeZone: 'Asia/Taipei'})}`;
    message =
      message instanceof Error ? `${message.name} ${message.message} ${message.stack}` : message;
    console.log(`[${level}] ${message} [${formatTime}]`);
  }
}

export const ignoreUndefined = (newValue: any, defaultValue: any) => {
  return newValue !== undefined ? newValue : defaultValue;
};

export const getDateOnly = (targetDate: Date) => {
  const dateInput = object({
    date: dateSchema()
      .optional()
      .default(() => new Date()),
  });
  const todayDateString = targetDate.toLocaleDateString('zh-tw');
  const { date } = dateInput.cast({ date: todayDateString });

  return date;
};

export const getDefaultDate = () => {
  const dateInput = object({
    date: dateSchema()
      .optional()
      .default(() => new Date()),
  });
  const todayDateString = new Date().toLocaleDateString('zh-tw');
  const { date } = dateInput.cast({ date: todayDateString });

  return date;
};

export const appError = (options: {
  code?: number;
  message: string;
  next?: NextFunction;
}) => {
  const { code, message, next } = options;
  const error: ResponseError = new Error(message);
  error.code = code;
  Logger.error(error);
  if (next) {
    next(error);
  } else {
    throw error;
  }
};

export const catchError = (error: Error, next: NextFunction) =>
  appError({ code: 500, message: error.message as string, next });

export const successHandle = (res, message = '', data: Data[] | Data) => {
  res.send({
    status: true,
    message: message,
    ...Array.isArray(data) || typeof data === 'object' ? data : null,
  });
};

export const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_+<>?:"{},.\-\/\\;'[\]]).{8,}$/;

export const passwordCheck = (password: string) => {
  return passwordRule.test(password);
};

export const randomPassword = () => {
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  const calpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const num = '1234567890';
  const specials = ',.!@#$%^&*/|][-_=+?><;:~`{}()';
  const options = [alpha, alpha, alpha, calpha, calpha, num, num, specials];
  let opt: number, choose: number;
  let pass = '';
  for (let i = 0; i < 8; i++) {
    opt = Math.floor(Math.random() * options.length);
    choose = Math.floor(Math.random() * options[opt].length);
    pass = pass + options[opt][choose];
    options.splice(opt, 1);
  }
  return pass;
};

export const handleErrorAsync = (func: Function) => {
  return (req: Request, res: Response, next: NextFunction) => func(req, res, next).catch((error: Error) => catchError(error, next));
};

export const validateInput = async (schema: Schema, data, next: NextFunction) => {
  try {
    await schema.validate(data);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      const yupError = error as { errors: string[] };
      throw appError({ code: 400, message: yupError.errors.join(", "), next });
    }
    throw appError({ code: 400, message: '驗證失敗', next });
  }
};

export const processDate = (dateString: Date, endOfDay = false) => {
  const date = new Date(dateString);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999); // 設置為當天結束時間
  } else {
    date.setHours(0, 0, 0, 0); // 設置為當天開始時間
  }
  return date;
};

export const dateOrNull = (originalValue: string): Date | null => {
  return originalValue.trim() === '' ? null : new Date(originalValue);
};

const customEmitter = new EventEmitter();

export default customEmitter;
