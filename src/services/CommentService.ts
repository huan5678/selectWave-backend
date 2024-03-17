import { Comment, Poll, User } from "@/models";
import { IComment } from "@/types";
import { appError } from "@/utils";
import { NextFunction } from "express";
import { FilterQuery, Types } from "mongoose";

export class CommentService {
  static countDocuments = async (query: FilterQuery<IComment>) =>
    Comment.countDocuments(query).exec();

  static createComment = async (
    author: string,
    content: string,
    pollId: string
  ) => {
    try {
      const authorObjectId = new Types.ObjectId(author);
      const pollObjectId = new Types.ObjectId(pollId);
      // 創建 Comment
      const comment = new Comment({
        author: authorObjectId,
        content: content,
        pollId: pollObjectId,
      });

      await comment.save();
      // 更新 User 和 Poll
      await User.findByIdAndUpdate(author, { $push: { comments: comment } });
      await Poll.findByIdAndUpdate(
        pollId,
        { $push: { comments: comment } },
        { new: true }
      );
      return comment;
    } catch (error) {
      throw appError({
        code: 500,
        message: (error as Error).message,
      });
    }
  };

  static getComment = async (id: string, next: NextFunction) => {
    const comment = await Comment.findById(id)
      .populate("pollId", "title id")
      .exec();
    if (!comment) {
      throw appError({
        code: 404,
        message: "找不到評論",
        next,
      });
    }
    return comment;
  };

  static getComments = async (
    queryConditions: FilterQuery<IComment>,
    sort: string,
    skip: number,
    limit: number
  ) => {
    const comments = await Comment.find(queryConditions)
      .sort(sort || { createdTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate("pollId", "title id comments")
      .exec();
    return comments;
  };

  static getCommentByUser = async (id: string, next: NextFunction) => {
    const comments = await Comment.find({ author: id })
      .populate("pollId", "title id comments")
      .exec();
    if (!comments) {
      throw appError({
        code: 404,
        message: "使用者沒有評論",
        next,
      });
    }
    return comments;
  };

  static getCommentsByPoll = async (pollId: string, next: NextFunction) => {
    const comments = await Comment.find({ pollId })
      .sort({ createdTime: -1 })
      .populate([
        {
          path: "author",
          select: "name avatar",
        },
        {
          path: "replies",
          select: "content author createdTime edited updateTime",
          populate: {
            path: "author",
            select: "name avatar",
          },
        },
      ])
      .exec();
    if (!comments) {
      throw appError({
        code: 404,
        message: "找不到評論",
        next,
      });
    }
    return comments;
  };

  static getCommentByPollAndUser = async (
    pollId: string,
    userId: string,
    next: NextFunction
  ) => {
    if (!pollId || !userId) {
      throw appError({
        code: 400,
        message: "缺少必要的參數",
        next,
      });
    }
    const comments = await Comment.find({ pollId, author: userId })
      .populate({
        path: "pollId",
        select: "title id description createdTime status imageUrl tags",
        populate: {
          path: "tags",
          select: "name",
        },
      })
      .exec();
    if (!comments) {
      throw appError({
        code: 404,
        message: "找不到評論",
        next,
      });
    }
    return comments;
  };

  static updateComment = async (id: string, content: string) => {
    const comment = await Comment.findByIdAndUpdate(
      id,
      { content, edited: true, updateTime: new Date() },
      { new: true }
    ).populate("pollId", "title id");
    return comment;
  };

  static deleteComment = async (id: string, userId: string) => {
    const deletedComment = await Comment.findByIdAndDelete(id).exec();
    if (!deletedComment) {
      throw appError({
        code: 404,
        message: "找不到評論",
      });
    }
    const result = await Poll.findByIdAndUpdate(
      deletedComment.pollId,
      { $pull: { comments: { comment: id } } },
      { new: true }
    );
    await User.findByIdAndUpdate(userId, { $pull: { comments: id } });
    return result;
  };

  static deleteCommentByPollId = async (pollId: string) => {
    const result = await Comment.deleteMany({ pollId: pollId }).exec();
    return result;
  };
}

export default CommentService;
