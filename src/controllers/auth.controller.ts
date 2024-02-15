import { NextFunction, RequestHandler, Response } from 'express';
import { AuthRequest } from '@/types';
import { object, string } from 'yup';
import { AuthService } from '@/services';
import { appError, successHandle, verifyToken } from '@/utils';
import MailServiceController from './mailer.controller';
import { TokenBlacklist, User } from '@/models';

class AuthController {
  public static decodeTokenHandler = async (req: AuthRequest, res) => {
    return successHandle(res, 'success', { result: req.auth });
  };

  public static verifyAccount: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.query; // 假設 token 通過 URL 參數傳遞
    if (!token) {
      return appError({ code: 400, message: '缺少 token', next });
    }
    const decoded = verifyToken(token as string);
    if (!decoded) {
      return appError({ code: 400, message: '無效的 token', next });
    }
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return appError({ code: 404, message: '無效的驗證連結或已過期', next });
    }

    user.verificationToken = '';
    user.isValidator = true;
    await user.save();

    res.send({ message: '使用者成功驗證' });
  } catch (error) {
    console.log('Verification error:', error);
    appError({ code: 500, message: '驗證失敗', next });
  }
};

  public static registerHandler: RequestHandler = async (req, res, next) => {
    const inputSchema = object({
      email: string().email().required().lowercase(),
      password: string().required(),
      confirmPassword: string().required(),
    });
    if (req.body.password !== req.body.confirmPassword)
      throw appError({ code: 400, message: 'password not match', next });
    const isValidate = await inputSchema.validate(req.body);
    if (!isValidate) throw appError({ code: 400, message: 'invalid input', next});
    const { email, password } = inputSchema.cast(req.body);
    // check member existence
    if (await AuthService.getMemberByAccountOrEmail(email)) {
      appError({ code: 400, message: 'member already exists', next });
    } else {
      const { authToken } = await AuthService.registerMember({
        email,
        password,
      }, next);
      req.body.token = authToken;
      req.body.email = email;
      MailServiceController.sendVerificationEmail(req, res, next);
      return successHandle(res, 'success', { result: authToken });
    }
    return appError({ code: 400, message: 'invalid input', next });
  };

  public static loginHandler: RequestHandler = async (req, res, next) => {
    // validate input
    const inputSchema = object({
      email: string().required().email(),
      password: string().required(),
    });
    try {
      const isValidate = await inputSchema.validate(req.body);
      if (!isValidate) throw appError({ code: 400, message: 'invalid input' });

      const { email, password } = inputSchema.cast(req.body);
      const { authToken, member } = await AuthService.login({ email, password }, next);
      return successHandle(res, 'success', { authToken, member });
    } catch (error) {
      throw appError({ code: 500, message: (error as Error).message, next });
    }
  };
  public static logoutHandler: RequestHandler = async (req, res, next: NextFunction) =>
  {
    if (!req.headers.authorization) {
      return appError({ code: 400, message: 'no token', next });
    }
    const token = req.headers.authorization.split(' ')[ 1 ];
    const decodedToken = verifyToken(token) as { exp: number };
    const expiresAt = new Date(decodedToken.exp * 1000);
    await TokenBlacklist.create({ token, expiresAt });

    return successHandle(res, '成功登出', { result: true });
  };

  public static resetPasswordHandler: RequestHandler = async (
    req,
    res: Response,
    next: NextFunction,
  ) => {
    const inputSchema = object({
      email: string().required().email(),
    });

    const isValidate = await inputSchema.validate(req.body);
    if (!isValidate) throw appError({ code: 400, message: 'invalid input' });
    const { email } = inputSchema.cast(req.body);
    const member = await AuthService.getMemberByAccountOrEmail(email);
    if (!member) {
      throw appError({ code: 401, message: 'no such member', next });
    }
    try {
      MailServiceController.sendResetEmail(req, res, next);
      successHandle(res, 'success', { result: true });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error', next });
    }
  };

  public static changePasswordHandler: RequestHandler = async (
    req,
    res: Response,
    next: NextFunction,
  ) => {
    const inputSchema = object({
      email: string().required().email(),
      password: string().required(),
      confirmPassword: string().required(),
    });
    if (req.body.password !== req.body.confirmPassword)
      throw appError({ code: 400, message: 'password not match', next });

    const isValidate = await inputSchema.validate(req.body);
    if (!isValidate) throw appError({ code: 400, message: 'invalid input', next });

    const { email, password } = inputSchema.cast(req.body);
    const member = await AuthService.getMemberByAccountOrEmail(email);
    if (!member) {
      throw appError({ code: 401, message: 'no such member' });
    }
    await AuthService.updatePassword({ email, password, next });
    successHandle(res, 'success', { result: true });
  };
}

export default AuthController;
