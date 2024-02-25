import { IComment } from '@/types';
import { Schema, model } from 'mongoose';

const commentSchema = new Schema<IComment>({
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: [true, '請確實填寫投票'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '請確實填寫留言者'],
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
}, {
  timestamps: { createdAt: 'createdTime', updatedAt: 'updateTime' },
  versionKey: false,
    toJSON: {
      virtuals: true
    },
    toObject: {
        virtuals: true
    },
});

commentSchema.pre(/^find/, function(next) {
  (this as IComment).populate([{
    path: 'author',
    select: 'name avatar'
  }]);
  next();
});


commentSchema.post('save', async function(doc, next) {
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
      path: 'comments',
      populate: {
        path: 'author',
      }
    });

  const userIdsToNotify = new Set();

  userIdsToNotify.add(poll.createdBy._id.toString());

  poll.like.forEach(like => {
    userIdsToNotify.add(like.user._id.toString());
  });

  poll.options.forEach(option => {
    option.voters.forEach(voter => {
      userIdsToNotify.add(voter.user._id.toString());
    });
  });

  poll.comments.forEach(comment => {
    userIdsToNotify.add(comment.author._id.toString());
  });

  const wss = require('@/app').wss;
  wss.clients.forEach(client => {
    if (userIdsToNotify.has(client.userId) && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'newComment',
        message: 'A new comment has been added to a poll you are interested in.',
        pollId: doc.pollId,
        commentId: doc._id,
      }));
    }
  });

  next();
});



export default model<IComment>('Comment', commentSchema);
