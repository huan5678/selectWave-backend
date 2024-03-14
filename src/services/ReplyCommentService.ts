import { Comment, Reply } from "@/models";
import { IComment } from "@/types";
import { FilterQuery } from "mongoose";

export class ReplyCommentService
{
  static countDocuments = async (query: FilterQuery<IComment>) =>
    Reply.countDocuments(query).exec();
  
  static getReply = async (id: string) => Reply.findById(id)
      .select('content createdTime edited updateTime')
      .populate({
        path: 'commentId',
        select: 'content createdTime edited updateTime',
        populate: {
          path: 'pollId',
          select: 'title id',
        },
      }).exec();
  
  static getReplyByUser = async (id: string) =>
  {
    const result = await Reply.find({ author: id })
      .select('content createdTime edited updateTime')
      .populate({
        path: 'commentId',
        select: 'content createdTime edited updateTime',
        populate: {
          path: 'pollId',
          select: 'title id',
        },
      });
    return result;
  }

  static createReply = async (author: string, content: string, commentId: string) =>
  {
    const reply = await Reply.create({
      author,
      content,
      commentId,
    });
    const result = await Comment.findByIdAndUpdate(
      commentId,
      {
        $push: {
          replies: reply._id,
        },
      },
      { new: true }
    ).populate({
    path: 'replies',
    select: 'content author createdTime edited updateTime',
    populate: {
      path: 'author',
      select: 'name avatar',
    },
  });
    return result;
  }

  static updateReply = async (id: string, content: string) =>
  {
    const result = await Reply.findByIdAndUpdate(
      id,
      {
        content,
        edited: true,
        updateTime: new Date(),
      },
      { new: true }
    );
    return result;
  }

  static deleteReply = async (id: string) =>
  {
    const reply = await Reply.findById(id);
    if (!reply) return null;
    const result = await Comment.findByIdAndUpdate(id, {
      $pull: {
        replies: id,
      },
    });
    await Reply.findByIdAndDelete(id);
    return result;
  }
}

export default ReplyCommentService;