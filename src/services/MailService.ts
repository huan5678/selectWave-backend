import nodemailer from "nodemailer";

class MailService {
  public static transporter: nodemailer.Transporter;
  static FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

  public static sendMail = async (mailOptions: nodemailer.SendMailOptions) => {
    await MailService.transporter.verify();
    const info = await MailService.transporter.sendMail(mailOptions);
    return info;
  };

}

MailService.transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_CLIENT_PASSWORD,
  },
});

export default MailService;