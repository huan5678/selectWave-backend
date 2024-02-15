import { NextFunction, RequestHandler, Response } from 'express';
import { Comment } from '@/models';
import { appError, successHandle } from '@/utils';

class CommentController {
  // 創建新評論
  public static createComment: RequestHandler = async (req, res: Response, next: NextFunction) => {
    try {
      const { userId, content } = req.body;
      const newComment = await Comment.create({
        userId,
        content,
        pollId: req.params.pollId,
        role: 'author',
      });
      successHandle(res, '評論創建成功', { newComment });
    } catch (error) {
      appError({ code: 500, message: '評論創建失敗', next});
    }
  };

  // 更新評論
  public static updateComment: RequestHandler = async (req, res: Response, next: NextFunction) => {
    try {
      const { commentId, content, userId } = req.body;
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw appError({
          code: 404, message: '找不到評論', next});
      }
      if (comment.userId && comment.userId.toString() !== userId) {
        throw appError({ code: 403, message: '沒有權限更新評論', next});
      }
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content, edited: true, updateTime: Date.now() },
        { new: true },
      );
      if (!updatedComment) {
        throw appError({ code: 500, message: '評論更新失敗', next});
      }
      successHandle(res, '評論更新成功', { updatedComment });
    } catch (error) {
      appError({ code: 500, message: '評論更新失敗', next});
    }
  };

  // 刪除評論
  public static deleteComment: RequestHandler = async (req, res: Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const deletedComment = await Comment.findByIdAndDelete(commentId);
      if (!deletedComment) {
        throw appError({ code: 404, message: '找不到評論', next});
      }
      successHandle(res, '評論刪除成功', { deletedComment });
    } catch (error) {
      appError({ code: 500, message: '評論刪除失敗', next });
    }
  };

  // 獲取特定評論
  public static getComment: RequestHandler = async (req, res:Response, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw appError({ code: 404, message: '找不到評論', next });
      }
      successHandle(res, '獲取評論成功', { comment });
    } catch (error) {
      appError({ code: 500, message: '獲取評論失敗', next });
    }
  };
}

export default CommentController;
