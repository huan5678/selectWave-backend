import { RequestHandler } from "express";
import { Contact } from "@/models";
import { appError, successHandle } from "@/utils";
import { object, string } from "yup";

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
    const contact = await Contact.findOne({ "emailSubscriber.email": email });
    if (contact) {
      throw appError({ code: 400, message: "您已經訂閱過了", next });
    } else {
      await Contact.updateOne({}, { $push: { emailSubscriber: { email } } });
      return successHandle(res, "感謝您的訂閱", {});
    }
  };
}

export default ContactController;
