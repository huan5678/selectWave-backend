import { NextFunction, RequestHandler, Response } from 'express';
import { AuthRequest, TokenPayload } from '@/types';
import { object, string } from 'yup';
import { AuthService } from '@/services';
import { appError, getToken, successHandle, verifyToken } from '@/utils';
import MailServiceController from './mailer.controller';
import { TokenBlacklist, User } from '@/models';

class AuthController {
  public static decodeTokenHandler = async (req, res: Response, next: NextFunction) =>
  {
    try {
      const { user } = req;
      return successHandle(res, '驗證成功取得使用者資訊', { result: user });
    } catch (error) {
      return appError({ code: 500, message: (error as Error).message, next });
    }
  };

  public static verifyAccount: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.query; // 假設 token 通過 URL 參數傳遞
    if (!token) {
      return appError({ code: 400, message: '缺少 token', next });
    }
    const decoded = verifyToken(token as string) as TokenPayload;
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

    return successHandle(res, '使用者成功驗證', { result: user });
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
      throw appError({ code: 400, message: '密碼不一致', next });
    const isValidate = await inputSchema.validate(req.body);
    if (!isValidate) throw appError({ code: 400, message: '請確認輸入的欄位格式是否正確', next});
    const { email, password } = inputSchema.cast(req.body);
    // check member existence
    if (await AuthService.getMemberByAccountOrEmail(email)) {
      appError({ code: 400, message: '此 Email 已註冊', next });
    } else {
      const { authToken } = await AuthService.registerMember({
        email,
        password,
      }, next);
      req.body.token = authToken;
      req.body.email = email;
      MailServiceController.sendVerificationEmail(req, res, next);
      return successHandle(res, '註冊成功', { result: { token: authToken } });
    }
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
    const token = getToken(req);
    if (!token) {
      return appError({ code: 400, message: '缺少 token', next });
    }
    const decodedToken = verifyToken(token) as TokenPayload;
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
    if (!isValidate) throw appError({ code: 400, message: 'Email 格式有誤，請確認輸入是否正確' });
    const { email } = inputSchema.cast(req.body);
    const member = await AuthService.getMemberByAccountOrEmail(email);
    if (!member) {
      throw appError({ code: 404, message: '此 Email 未註冊', next });
    }
    try {
      MailServiceController.sendResetEmail(req, res, next);
      successHandle(res, '成功送出重設密碼信件，請收信並進行重設步驟', { result: true });
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
      throw appError({ code: 400, message: '密碼不一致', next });

    const isValidate = await inputSchema.validate(req.body);
    if (!isValidate) throw appError({ code: 400, message: 'invalid input', next });

    const { email, password } = inputSchema.cast(req.body);
    const member = await AuthService.getMemberByAccountOrEmail(email);
    if (!member) {
      throw appError({ code: 404, message: '已無此使用者請重新註冊' });
    }
    await AuthService.updatePassword({ email, password, next });
    successHandle(res, 'success', { result: true });
  };
}

export default AuthController;
