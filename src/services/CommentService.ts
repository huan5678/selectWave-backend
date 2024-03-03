import { Comment, Poll, User } from "@/models";
import { appError } from "@/utils";
import { NextFunction } from "express";

export class CommentService
{
  static createComment = async (author: string, content: string, pollId: string) =>
  {
    const comment = await Comment.create({
      author,
      content,
      pollId,
    });
    await User.findByIdAndUpdate(author, { $push: { comments: comment.id } });
    const result = await Poll.findByIdAndUpdate(
      { id: pollId },
      { $push: { comments: { comment } } },
      { new: true }
    );
    return result;
  }

  static getComment = async (id: string, next: NextFunction) =>
  {
    const comment = await Comment.findById(id).exec();
    if (!comment) {
      throw appError({
        code: 404,
        message: "找不到評論",
        next,
      });
    }
    return comment;
  }

  static getCommentByUser = async (id: string, next: NextFunction) =>
  {
    const comments = await Comment.find({ author: id }).exec();
    if (!comments) {
      throw appError({
        code: 404,
        message: "使用者沒有評論",
        next,
      });
    }
    return comments;
  }

  static updateComment = async (id: string, content: string) =>
  {
    const comment = await Comment.findByIdAndUpdate(
      id,
      { content, edited: true, updateTime: Date.now() },
      { new: true }
    );
    return comment;
  }

  static deleteComment = async (id: string, userId: string) =>
  {
    const deletedComment = await Comment.findByIdAndDelete(id).exec();
    if (!deletedComment) {
      throw appError({
        code: 404,
        message: "找不到評論",
      });
    }
    const result = await Poll.findByIdAndUpdate(
      { id: deletedComment.pollId },
      { $pull: { comments: { comment: id } } },
      { new: true }
    );
    await User.findByIdAndUpdate(userId, { $pull: { comments: id } });
    return result;
  }
}

export default CommentService;
