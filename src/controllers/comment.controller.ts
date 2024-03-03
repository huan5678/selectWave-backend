import { RequestHandler } from "express";
import { appError, successHandle, validateInput } from "@/utils";
import { object, string } from "yup";
import { IUser } from "@/types";
import { CommentService } from "@/services";

const createCommentSchema = object({
  pollId: string().required("請輸入投票ID"),
  content: string()
    .required("請輸入評論內容")
    .min(1, "評論內容請大於 1 個字")
    .max(200, "評論內容長度過長，最多只能 200 個字"),
});

const updateCommentSchema = object({
  content: string()
    .required("請輸入評論內容")
    .min(1, "評論內容請大於 1 個字")
    .max(200, "評論內容長度過長，最多只能 200 個字"),
});

class CommentController {
  // 創建新評論
  public static createComment: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    if (!(await validateInput(createCommentSchema, req.body, next))) return;

    const { content, pollId } = req.body;
    const result = await CommentService.createComment(id, content, pollId);
    successHandle(res, "評論創建成功", { result });
  };

  // 更新評論
  public static updateComment: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    if (!(await validateInput(updateCommentSchema, req.body, next))) return;
    const commentId = req.params.id;
    if (!commentId) {
      throw appError({ code: 400, message: "請輸入評論ID", next });
    }
    const { content } = req.body;
    const comment = await CommentService.getComment(commentId, next);

    if (comment.author.id !== id) {
      throw appError({ code: 403, message: "沒有權限更新評論", next });
    }
    const updatedComment = await CommentService.updateComment(commentId, content);
    successHandle(res, "評論更新成功", { updatedComment });
  };

  // 刪除評論
  public static deleteComment: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;
    if (!id) throw appError({ code: 400, message: "請輸入評論ID", next });
    const result = await CommentService.deleteComment(id, userId);
    successHandle(res, "評論刪除成功", { result });
  };

  // 獲取特定評論
  public static getComment: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    if (!id) throw appError({ code: 400, message: "請輸入評論ID", next });
    const comment = await CommentService.getComment(id, next);
    successHandle(res, "獲取評論成功", { comment });
  };

  // 獲取使用者所有評論
  public static getComments: RequestHandler = async (req, res, next) =>
  {
    const { id } = req.user as IUser;
    const comments = await CommentService.getCommentByUser(id, next);
    successHandle(res, "獲取所有評論成功", { comments });
  };
}

export default CommentController;
