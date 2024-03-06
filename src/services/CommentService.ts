import { Comment, Poll, User } from "@/models";
import { IComment } from "@/types";
import { appError } from "@/utils";
import { NextFunction } from "express";
import { FilterQuery } from "mongoose";

export class CommentService
{

  static countDocuments = async (query: FilterQuery<IComment>) => Comment.countDocuments(query).exec();

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
    const comment = await Comment.findById(id)
      .populate('pollId', 'title id')
      .exec();
    if (!comment) {
      throw appError({
        code: 404,
        message: "找不到評論",
        next,
      });
    }
    return comment
  }

  static getComments = async (queryConditions: FilterQuery<IComment>, sort: string, skip: number, limit: number) => {
    const comments = await Comment.find(queryConditions)
      .sort(sort || { createdTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('pollId', 'title id comments')
      .exec();
    return comments;
  }

  static getCommentByUser = async (id: string, next: NextFunction) =>
  {
    const comments = await Comment.find({ author: id })
      .populate('pollId', 'title id comments')
      .exec();
    if (!comments) {
      throw appError({
        code: 404,
        message: "使用者沒有評論",
        next,
      });
    }
    return comments;
  }

  static getCommentByPollAndUser = async (pollId: string, userId: string, next: NextFunction) =>
  {
    if (!pollId || !userId) {
      throw appError({
        code: 400,
        message: "缺少必要的參數",
        next,
      });
    }
    const comments = await Comment.find({ pollId, author: userId })
      .populate({
        path: 'pollId',
        select: 'title id description createdTime status imageUrl tags',
        populate: {
          path: 'tags',
          select: 'name',
        }
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
  }

  static updateComment = async (id: string, content: string) =>
  {
    const comment = await Comment.findByIdAndUpdate(
      id,
      { content, edited: true, updateTime: Date.now() },
      { new: true }
    ).populate('pollId', 'title id');
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
