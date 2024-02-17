import { RequestHandler, Request, NextFunction, Response } from 'express';
import nodemailer from 'nodemailer';
import validator from 'validator';
import { object, string } from 'yup';
import jwt from 'jsonwebtoken';
import { appError, generateToken, successHandle } from '@/utils';
import User from '@/models/user';
import resetPasswordTemplate from '@/views/resetPassword';

const mailSchema = object().shape({
  from: string(),
  to: string().email().required().required('缺少收件者地址'),
  subject: string().required('缺少主旨'),
  text: string(),
  html: string().required('缺少內容'),
});

export class MailServiceController {
  public static transporter: nodemailer.Transporter;
  static FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

  //SEND MAIL
  public static sendMail: RequestHandler = async (req: Request, res: Response, next) => {
    try {
      mailSchema.validateSync(req.body);
    } catch (error) {
      if (error instanceof Error) {
        return appError({ code: 400, message: error.message });
      }
    }
    try {
      const { from, to, subject, text, html } = req.body;
      await MailServiceController.transporter.verify();
      const info = await MailServiceController.transporter.sendMail({
        from: `"選集客戶幫助中心" ${process.env.SMTP_SENDER || from}`,
        to,
        subject,
        text,
        html,
      });
      successHandle(res, '信件已寄出', { result: info });
    } catch (error) {
      console.log('catch err:', error);
      appError({ code: 500, message: 'Internal server error', next });
    }
  };

  public static sendVerificationEmail = async (req, _res, next) => {
    try {
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
        subject: '選集會員帳號驗證信',
        html,
      }
      await MailServiceController.transporter.verify();
      const info = await MailServiceController.transporter.sendMail(mailConfig);
      successHandle(_res, '驗證信已寄出', { result: info });
    } catch (error) {
      console.log('catch err:', error);
      appError({ code: 500, message: 'Internal server error', next });
    }
  };

  public static resendVerificationEmail: RequestHandler = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        return appError({code: 400, message: '無此帳號，請再次確認註冊 Email 帳號，或是重新註冊新帳號', next});
      }
      // 生成新的 token
      const newVerificationToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' } // Token 有效期 24 小时
      );

      // 更新 user.verificationToken
      user.verificationToken = newVerificationToken;
      await user.save();

      const verificationUrl = `${process.env.FRONTEND_DOMAIN}/verify-account?token=${newVerificationToken}`;
      const html = `
        <h1>感謝您註冊選集會員</h1>
        <p>請點擊以下連結以驗證您的 Email 帳號</p>
        <a href="${verificationUrl}">驗證 Email</a>
      `;
      const mailConfig = {
        from: `"選集客戶幫助中心" <${process.env.GMAIL_ACCOUNT}>`,
        to: email.trim().toLowerCase(),
        subject: '選集會員帳號驗證信',
        html,
      };

      const mailIsValidated = mailSchema.validateSync(mailConfig);
      if (!mailIsValidated) {
        return appError({ code: 400, message: '信件格式錯誤', next });
      }

      const transporter = MailServiceController.transporter;
      await transporter.verify();
      const info =await transporter.sendMail(mailConfig);
      successHandle(res, '驗證信已寄出', { result: `以成功寄送重新驗證信件至 Email: ${info.accepted}` });
    } catch (error) {
      throw new Error('Internal server error');
    }
  }

  public static sendResetEmail: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    let { email } = req.body;
    email = email.trim().toLowerCase();
    if (!email) {
      return appError({
        code: 400,
        message: '請填入 email 欄位',
        next,
      });
    }
    if (!validator.isEmail(email)) {
      return appError({
        code: 400,
        message: '請正確輸入 email 格式',
        next,
      });
    }
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return appError({
        code: 400,
        message: '無此帳號，請再次確認註冊 Email 帳號，或是重新註冊新帳號',
        next,
      });
    }

    const token = generateToken({ userId: user._id});
    await User.findByIdAndUpdate(user._id, { resetToken: token });

    try {
      await MailServiceController.transporter.verify();
      const info = await MailServiceController.transporter.sendMail({
        from: `"選集會員服務中心" <${process.env.GMAIL_ACCOUNT}>`,
        to: `${user.name} <${email}>`,
        subject: '「選集」 忘記密碼驗證通知信',
        html: resetPasswordTemplate({ userName: user.name, resetUrl: `${this.FRONTEND_DOMAIN}/verify-account?token=${token}` })
      });
      if (info.accepted.length === 0) {
        return appError({
          code: 500,
          message: '信件寄送失敗',
          next,
        });
      }
      successHandle(res, '信件已寄出', { result: `以成功寄送驗證信件至 Email: ${info.accepted}` });
    } catch (error) {
      console.log('catch err:', error);
      appError({ code: 500, message: 'Internal server error' });
    }
  };
}



MailServiceController.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_CLIENT_PASSWORD,
  },
});

export default MailServiceController;
