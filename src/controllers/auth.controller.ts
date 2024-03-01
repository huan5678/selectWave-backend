import { RequestHandler } from "express";
import { object, string } from "yup";
import { AuthService, TokenBlackListService } from "@/services";
import { appError, getToken, successHandle, validateInput } from "@/utils";
import MailServiceController from "./mailer.controller";
import { IUser } from "@/types";

const inputSchema = object({
  email: string().email().required().lowercase(),
  password: string().required(),
  confirmPassword: string(),
});

const emailInputSchema = object({
  email: string().required().email(),
});
class AuthController {
  public static decodeTokenHandler: RequestHandler = async (req, res) => {
    const { user } = req;
    return successHandle(res, "驗證成功取得使用者資訊", { result: user });
  };

  public static verifyAccount: RequestHandler = async (req, res, next) => {
    const { token } = req.query; // 假設 token 通過 URL 參數傳遞
    if (!token) {
      throw appError({ code: 400, message: "缺少 token", next });
    }
    const user = await AuthService.verifyUserByToken(token as string, next);

    return successHandle(res, "使用者成功驗證", { result: user });
  };

  public static registerHandler: RequestHandler = async (req, res, next) => {
    if (!(await validateInput(inputSchema, req.body, next))) return;
    const { email, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      throw appError({ code: 400, message: "密碼不一致", next });
    // check member existence
    await AuthService.getMemberByAccountOrEmail(email);
    const { authToken } = await AuthService.registerMember(
      {
        email,
        password,
      },
      next
    );
    req.body.token = authToken;
    req.body.email = email;
    MailServiceController.sendVerificationEmail(req, res, next);
    return successHandle(res, "註冊成功", { result: { token: authToken } });
  };

  public static loginHandler: RequestHandler = async (req, res, next) => {
    if (!(await validateInput(inputSchema, req.body, next))) return;
    const { email, password } = req.body;
    const { authToken, member } = await AuthService.login(
      { email, password },
      next
    );
    return successHandle(res, "success", { authToken, member });
  };
  public static logoutHandler: RequestHandler = async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
      throw appError({ code: 400, message: "缺少 token", next });
    }
    await TokenBlackListService.createTokenBlackList(token);

    return successHandle(res, "成功登出", { result: true });
  };

  public static resetPasswordHandler: RequestHandler = async (
    req,
    res,
    next
  ) =>
  {
    if (!(await validateInput(emailInputSchema, req.body, next))) return;
    const { email } = req.body;
    await AuthService.getMemberByAccountOrEmail(email);
    MailServiceController.sendResetEmail(req, res, next);
  };

  public static verifyResetPasswordHandler: RequestHandler = async (
    req,
    _res,
    next
  ) => {
    const { token, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      throw appError({ code: 400, message: "密碼不一致", next });
    }
    if (!token) {
      throw appError({ code: 400, message: "缺少 token", next });
    }
    const result = await AuthService.resetPasswordByRestToken(token, password, next);
    return successHandle(_res, "成功重設密碼", { result });
  };

  public static changePasswordHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    if (req.body.password !== req.body.confirmPassword)
      throw appError({ code: 400, message: "密碼不一致", next });

    const isValidate = await inputSchema.validate(req.body);
    if (!isValidate)
      throw appError({ code: 400, message: "invalid input", next });
    const { email } = req.user as IUser;
    const { password } = inputSchema.cast(req.body);
    await AuthService.getMemberByAccountOrEmail(email);
    await AuthService.updatePassword({ email, password, next });
    successHandle(res, "success", { result: true });
  };
}

export default AuthController;
