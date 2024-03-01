import { RequestHandler } from "express";
import jsonWebToken from 'jsonwebtoken';
import { appError, successHandle, validateInput } from "@/utils";
import { object, string } from "yup";
import { ContactService } from "@/services";

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
  public static create: RequestHandler = async (req, res, next) =>
  {
    if (!(await validateInput(contactSchema, req.body, next))) return;
    const { name, email, message, quests } = req.body;
    await ContactService.create(name, email, message, quests);
    return successHandle(res, "感謝您的留言", {});
  };

  public static subscribe: RequestHandler = async (req, res, next) => {
    const { email } = await emailSubscriberSchema.validate(req.body);
    if (!email) {
      throw appError({ code: 400, message: "請輸入正確的Email格式", next });
    }
    const unScribedToken = jsonWebToken.sign(email, JWT_SECRET as unknown as string);
    await ContactService.subscribe(email, unScribedToken);
    return successHandle(res, "感謝您的訂閱", {});
  };

  public static unsubscribe: RequestHandler = async (req, res, next) =>
  {
    try {
    const { token } = req.body;
    const email = jsonWebToken.verify(token, JWT_SECRET as unknown as string);
    await ContactService.unsubscribe(email as string);

    return successHandle(res, "退訂成功，期待您再次訂閱電子報", {});
    } catch (error) {
      if ((error as Error).name === "JsonWebTokenError") {
        throw appError({ code: 400, message: "驗證失敗請確認是否有權限取消訂閱", next });
      }
    }
  };
}

export default ContactController;
