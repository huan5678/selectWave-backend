import { RequestHandler } from "express";
import { appError, successHandle, validateInput } from "@/utils";
import { object, string } from "yup";
import { IUser } from "@/types";
import { ReplyCommentService } from "@/services";

const commentSchema = object({
  content: string()
    .required("請輸入評論內容")
    .min(1, "評論內容請大於 1 個字")
    .max(200, "評論內容長度過長，最多只能 200 個字"),
});

class ReplyController
{
  static getReplyByUser: RequestHandler = async (req, res) =>
  {
    const { id } = req.user as IUser;
    const result = await ReplyCommentService.getReplyByUser(id);
    successHandle(res, "獲取回覆成功", { result });
  };

  static createReply: RequestHandler = async (req, res, next) =>
  {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;
    if (!id) throw appError({ code: 400, message: "請輸入評論ID", next });
    if (!(await validateInput(commentSchema, req.body, next))) return;

    const { content } = req.body;

    const result = await ReplyCommentService.createReply(userId, content, id);

    successHandle(res, "回覆創建成功", { result });
  };

  static updateReply: RequestHandler = async (req, res, next) =>
  {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;
    if (!id) throw appError({ code: 400, message: "請輸入回覆ID", next });
    const reply = await ReplyCommentService.getReply(id);
    if (!reply) {
      throw appError({ code: 404, message: "找不到回覆", next });
    }
    if (reply.author.id !== userId) {
      throw appError({ code: 403, message: "沒有權限更新回覆", next });
    }
    if (!(await validateInput(commentSchema, req.body, next))) return;

    const { content } = req.body;
    const result = await ReplyCommentService.updateReply(id, content);

    successHandle(res, "回覆更新成功", { result });
  };

  static deleteReply: RequestHandler = async (req, res, next) =>
  {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;
    if (!id) throw appError({ code: 400, message: "請輸入回覆ID", next });
    const reply = await ReplyCommentService.getReply(id);
    if (!reply) {
      throw appError({ code: 404, message: "找不到回覆", next });
    }
    if (reply.author.id !== userId) {
      throw appError({ code: 403, message: "沒有權限刪除回覆", next });
    }
    const result = await ReplyCommentService.deleteReply(id);

    successHandle(res, "回覆刪除成功", { result });
  };
}

export default ReplyController;