import { RequestHandler } from 'express';
import { Comment } from '@/models';
import { appError, successHandle } from '@/utils';
import { object, string } from 'yup';
import { IUser } from '@/types';

const createCommentSchema = object({
  pollId: string().required('請輸入投票ID'),
  content: string().required('請輸入評論內容').min(1, '評論內容請大於 1 個字').max(200, '評論內容長度過長，最多只能 200 個字'),
});

const updateCommentSchema = object({
  commentId: string().required('請輸入評論ID'),
  content: string().required('請輸入評論內容').min(1, '評論內容請大於 1 個字').max(200, '評論內容長度過長，最多只能 200 個字'),
});

class CommentController {
  // 創建新評論
  public static createComment: RequestHandler = async (req, res, next) => {
      const { id } = req.user as IUser;
      const validationResult = await createCommentSchema.validate(req.body);
      if (!validationResult) {
        throw appError({ code: 400, message: '請確實填寫評論資訊', next});
      }
      const { content, pollId } = req.body;
      const newComment = await Comment.create({
        userId: id,
        content,
        pollId,
        role: 'author',
      });
      successHandle(res, '評論創建成功', { newComment });
  };

  // 更新評論
  public static updateComment: RequestHandler = async (req, res, next) => {
      const { id } = req.user as IUser;
      const validationResult = await updateCommentSchema.validate(req.body);
      if (!validationResult) {
        throw appError({ code: 400, message: '請確實填寫評論資訊', next});
      }
      const { commentId, content } = req.body;
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw appError({
          code: 404, message: '找不到評論', next});
      }
      if (comment.userId && comment.userId !== id) {
        throw appError({ code: 403, message: '沒有權限更新評論', next});
      }
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content, edited: true, updateTime: Date.now() },
        { new: true },
      );
      successHandle(res, '評論更新成功', { updatedComment });
  };

  // 刪除評論
  public static deleteComment: RequestHandler = async (req, res, next) => {
      const { commentId } = req.params;
      const deletedComment = await Comment.findByIdAndDelete(commentId);
      if (!deletedComment) {
        throw appError({ code: 404, message: '找不到評論', next});
      }
      successHandle(res, '評論刪除成功', { });
  };

  // 獲取特定評論
  public static getComment: RequestHandler = async (req, res, next) => {
      const { commentId } = req.params;
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw appError({ code: 404, message: '找不到評論', next });
      }
      successHandle(res, '獲取評論成功', { comment });
  };
}

export default CommentController;
