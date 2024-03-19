import { User, Poll, Comment } from '@/models';
import { appError } from '@/utils';
import { NextFunction } from 'express';

type Model = 'User' | 'Poll' | 'Comment';

export async function modelFindByID (model: Model, id: string, next: NextFunction) {
  switch (model) {
    case 'User':
      const user = await User.findById(id).exec();
      if (!user) {
        throw appError({ code: 404, message: "找不到使用者資訊請確認 ID 是否正確", next });
      }
      break;
    case 'Poll':
      const poll = await Poll.findById(id).exec();
      if (!poll) {
        throw appError({ code: 404, message: "找不到提案資訊請確認 ID 是否正確", next });
      }
      break;
    case 'Comment':
      const comment = await Comment.findById(id).exec();
      if (!comment) {
        throw appError({ code: 404, message: "找不到評論資訊請確認 ID 是否正確", next });
      }
      break;
    default:
      break;
  }
}

export async function modelExists(
  model: Model,
  id: string,
  target: string,
  message: string,
  isExists: boolean)
{
  switch (model) {
    case 'User':
      const user = await User.findOne({ [ target ]: id }).exec();
      if (isExists && !user) {
        throw appError({ code: 404, message: `使用者${message}` });
      } else if (!isExists && user) {
        throw appError({ code: 400, message: `使用者${message}` });
      }
      break;
    case 'Poll':
      const poll = await Poll.findOne({ [ target ]: id }).exec();
      if (isExists && !poll) {
        throw appError({ code: 400, message: `投票${message}` });
      } else if (!isExists && poll) {
        throw appError({ code: 400, message: `投票${message}` });
      }
      break;
    case 'Comment':
      const comment = await Comment.findOne({ [ target ]: id }).exec();
      if (isExists && !comment) {
        throw appError({ code: 400, message: `評論${message}`});
      } else if (!isExists && comment) {
        throw appError({ code: 400, message: `評論${message}` });
      }
      break;
    default:
      break;
  }
}