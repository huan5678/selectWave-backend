import { RequestHandler } from "express";
import jsonWebToken from 'jsonwebtoken';
import { Contact, EmailSubscriber } from "@/models";
import { appError, successHandle } from "@/utils";
import { object, string } from "yup";

const { JWT_SECRET } = process.env;

const contactSchema = object({
  name: string().required("請輸入姓名"),
  email: string().email("請輸入正確的Email格式").required("請輸入E-Mail"),
  message: string().required("請輸入訊息"),
});

const emailSubscriberSchema = object({
  email: string().email("請輸入正確的Email格式").required("請輸入E-Mail"),
});

class ContactController {
  public static create: RequestHandler = async (req, res, next) => {
    const validate = await contactSchema
      .validate(req.body, { abortEarly: false })
      .catch((err) => {
        throw appError({ code: 400, message: err.errors.join(", "), next });
      });
    const { name, email, message } = validate;
    const { quests } = req.body;
    const contact = new Contact({ contact: { name, email, message, quests } });
    await contact.save();
    return successHandle(res, "感謝您的留言", {});
  };

  public static subscribe: RequestHandler = async (req, res, next) => {
    const { email } = await emailSubscriberSchema.validate(req.body);
    if (!email) {
      throw appError({ code: 400, message: "請輸入正確的Email格式", next });
    }
    const unScribedToken = jsonWebToken.sign(email, JWT_SECRET as unknown as string);
    const subscriber = await EmailSubscriber.findOne({ email });
    if (subscriber) {
      throw appError({ code: 400, message: "您已經訂閱過了", next });
    }
    const newSubscriber = new EmailSubscriber({ email, unScribedToken });
    await newSubscriber.save();
    return successHandle(res, "感謝您的訂閱", {});
  };

  public static unsubscribe: RequestHandler = async (req, res, next) =>
  {
    try {
    const { token } = req.body;
    const email = jsonWebToken.verify(token, JWT_SECRET as unknown as string);

    const subscriber = await EmailSubscriber.findOne({ email });
    if (!subscriber) {
      throw appError({ code: 400, message: "您尚未訂閱過", next });
    }
    await EmailSubscriber.deleteOne({ email });
      return successHandle(res, "退訂成功，期待您再次訂閱電子報", {});
    } catch (error) {
      if ((error as Error).name === "JsonWebTokenError") {
        throw appError({ code: 400, message: "驗證失敗請確認是否有權限取消訂閱", next });
      }
    }
  };
}

export default ContactController;
