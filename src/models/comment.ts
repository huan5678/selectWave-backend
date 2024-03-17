import { CallbackError, Schema, model } from 'mongoose';
import customEmitter from '@/utils';
import { IComment } from '@/types';

const commentSchema = new Schema<IComment>({
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: [true, '請確實填寫投票 ID'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '請確實填寫留言者 ID'],
  },
  content: {
    type: String,
    required: [true, '請填寫留言內容'],
    minLength: [1, '留言內容請大於 1 個字'],
    maxLength: [200, '留言內容長度過長，最多只能 200 個字'],
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  updateTime: {
    type: Date,
  },
  replies: [ {
    type: Schema.Types.ObjectId,
    ref: 'Reply',
  }]
}, {
  timestamps: { createdAt: 'createdTime', updatedAt: 'updateTime' },
  versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret)
      {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret)
      {
        ret.id = ret._id;
        delete ret._id;
      }
    },
});


commentSchema.pre(/^find/, function(next) {
  (this as IComment).populate([{
    path: 'author',
    select: 'name avatar'
  } ]);
  next();
});


commentSchema.post('save', async function (doc, next)
{
  try {
  const Poll = model('Poll');

  const poll = await Poll.findById(doc.pollId)
    .populate('createdBy')
    .populate('like.user')
    .populate({
      path: 'options',
      populate: {
        path: 'voters.user',
      }
    })
    .populate({
      path: 'comments.comment',
      select: 'content author createdTime edited updateTime',
      populate: {
        path: 'author',
        select: 'name avatar',
      }
    });
  
  if (!poll) {
      console.error('Poll not found for comment:', doc._id);
      return next();
    }

    if (!poll.createdBy) {
      console.error('CreatedBy not populated for poll:', poll._id);
      return next();
    }

//   const userIdsToNotify = new Set();

//  if (poll.createdBy) {
//   userIdsToNotify.add(poll.createdBy.id.toString());
// }

//   poll.like.forEach(like => {
//     userIdsToNotify.add(like.user.id.toString());
//   });

//   poll.options.forEach(option => {
//     option.voters.forEach(voter => {
//       userIdsToNotify.add(voter.user.id.toString());
//     });
//   });

//   poll.comments.forEach(comment => {
//     userIdsToNotify.add(comment.author.id.toString());
//   });

//   customEmitter.emit('commentAdded', {
//     pollId: doc.pollId,
//     commentId: doc._id,
//   });

    next();
  } catch (error) {
    console.error('Error in commentSchema post save middleware:', error);
    next(error as CallbackError);
  }
});

async function deleteReplies(replies: IComment[]) {
  const Reply = model('Reply');

  for (let reply of replies) {
    // 如果該回覆還有嵌套回覆,遞迴刪除
    if (reply.replies && reply.replies.length > 0) {
      await deleteReplies(reply.replies);
    }
    // 刪除該回覆
    await Reply.findByIdAndDelete(reply._id);
  }
}

commentSchema.pre(/^remove/, async function (next)
{
  const comment = this as IComment;
  // 遍歷所有回覆並刪除
  await deleteReplies(comment.replies);
  // 確保所有回覆都被刪除後,再刪除該comment
  next();
});

// 優化：提高查詢效率
commentSchema.index({ pollId: 1, author: 1 });

export default model<IComment>('Comment', commentSchema);
