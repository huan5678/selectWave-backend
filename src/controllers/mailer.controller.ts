import { RequestHandler } from "express";
import validator from "validator";
import { object, string } from "yup";
import { appError, successHandle } from "@/utils";

import resetPasswordTemplate from "@/views/resetPassword";
import { AuthService, MailService } from "@/services";

const mailSchema = object().shape({
  from: string(),
  to: string().email().required().required("缺少收件者地址"),
  subject: string().required("缺少主旨"),
  text: string().required("缺少內容"),
  html: string(),
});

export class MailServiceController {
  static FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || 'http://localhost:3000';
  //SEND MAIL
  public static sendMail: RequestHandler = async (req, res) => {
    mailSchema.validateSync(req.body);
    const { from, to, subject, text, html } = req.body;
    const info = await MailService.sendMail({
      from: `"選集客戶幫助中心" ${process.env.GMAIL_ACCOUNT || from}`,
      to,
      subject,
      text,
      html,
    });
    successHandle(res, "信件已寄出", { result: info });
  };

  public static sendVerificationEmail: RequestHandler = async (req, _res) => {
    const { email, token } = req.body;
    const verificationUrl = `${process.env.FRONTEND_DOMAIN}/verify-account?token=${token}`;
    const html = `
        <h1>感謝您註冊選集會員</h1>
        <p>請點擊以下連結以驗證您的 Email 帳號</p>
        <a href="${verificationUrl}">驗證 Email</a>
      `;
    const mailConfig = {
      from: `"選集客戶幫助中心" <${process.env.GMAIL_ACCOUNT}>`,
      to: email.trim().toLowerCase(),
      subject: "選集會員帳號驗證信",
      html,
    };
    await MailService.sendMail(mailConfig);
  };

  public static resendVerificationEmail: RequestHandler = async (
    req,
    res,
    next
  ) => {
    const { email } = req.body;
    // 生成新的 token
    const newVerificationToken = await AuthService.createVerificationToken(email, next);

    const verificationUrl = `${process.env.FRONTEND_DOMAIN}/verify-account?token=${newVerificationToken}`;
    const html = `
        <h1>感謝您註冊選集會員</h1>
        <p>請點擊以下連結以驗證您的 Email 帳號</p>
        <a href="${verificationUrl}">驗證 Email</a>
      `;
    const mailConfig = {
      from: `"選集客戶幫助中心" <${process.env.GMAIL_ACCOUNT}>`,
      to: email.trim().toLowerCase(),
      subject: "選集會員帳號驗證信",
      html,
    };

    const mailIsValidated = mailSchema.validateSync(mailConfig);
    if (!mailIsValidated) {
      throw appError({ code: 400, message: "信件格式錯誤", next });
    }

    const info = await MailService.sendMail(mailConfig);
    successHandle(res, "驗證信已寄出", {
      result: `以成功寄送重新驗證信件至 Email: ${info.accepted}`,
    });
  };

  public static sendResetEmail: RequestHandler = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      throw appError({
        code: 400,
        message: "請填入 email 欄位",
        next,
      });
    }
    if (!validator.isEmail(email)) {
      throw appError({
        code: 400,
        message: "請正確輸入 email 格式",
        next,
      });
    }

    const [ token, name ] = await AuthService.createResetToken(email, next);

    const html = resetPasswordTemplate({
      userName: name,
      resetUrl: `${this.FRONTEND_DOMAIN}/#/resetpassword?token=${token}`,
    });

    const mailConfig = {
      from: `"選集客戶幫助中心" <${process.env.GMAIL_ACCOUNT}>`,
      to: `${name} <${email}>`,
      subject: "「選集」 忘記密碼驗證通知信",
      html,
    };

    const info = await MailService.sendMail(mailConfig);
    if (info.accepted.length === 0) {
      throw appError({ code: 400, message: "無法寄送信件", next });
    }
    successHandle(res, "信件已寄出", {
      result: `以成功寄送驗證信件至 Email: ${info.accepted}`,
    });
  };
}



export default MailServiceController;
