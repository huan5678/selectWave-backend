import { Contact, EmailSubscriber } from "@/models";
import { appError } from "@/utils";

export class ContactService {
  static create = async (name: string, email: string, message: string, quests: string) => {
    const contact = new Contact({ contact: { name, email, message, quests } });
    await contact.save();
  }

  static subscribe = async (email: string, unScribedToken: string) => {
    const subscriber = await EmailSubscriber.findOne({ email });
    if (subscriber) {
      throw appError({ code: 400, message: "您已經訂閱過了" });
    }
    const newSubscriber = new EmailSubscriber({ email, unScribedToken });
    await newSubscriber.save();
  }

  static unsubscribe = async (email: string) => {
    const subscriber = await EmailSubscriber.findOne({ email });
    if (!subscriber) {
      throw appError({ code: 400, message: "您尚未訂閱過" });
    }
    await EmailSubscriber.deleteOne({ email });
  }
}

export default ContactService;
