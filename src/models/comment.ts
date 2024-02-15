import { IComment } from '@/types';
import { Schema, model } from 'mongoose';

const commentSchema = new Schema<IComment>({
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: [true, '請確實填寫投票'],
  },
  userId: {
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
  role: {
    type: String,
    default: 'user',
  },
  edited: {
    type: Boolean,
    default: false,
  },
  updateTime: {
    type: Date,
  },
});

export default model<IComment>('Comment', commentSchema);
