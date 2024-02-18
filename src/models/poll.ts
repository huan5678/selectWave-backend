import { Schema, model } from 'mongoose';
import { IPoll } from '@/types';

const pollSchema = new Schema<IPoll>({
  title: {
    type: String,
    required: [true, '請填寫投票標題'],
    minLength: [1, '投票標題請大於 1 個字'],
    maxLength: [50, '投票標題長度過長，最多只能 50 個字'],
  },
  description: {
    type: String,
    required: [true, '請填寫投票說明'],
    minLength: [1, '投票說明請大於 1 個字'],
    maxLength: [200, '投票說明長度過長，最多只能 200 個字'],
  },
  imageUrl: {
    type: String,
    default: 'https://i.imgur.com/D3hp8H6.png',
  },
  tags: [
    {
      type: String,
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '請確實填寫投票發起者'],
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  isPrivate: {
    type: Boolean, // true: 私人投票, false: 公開投票
    default: false,
  },
  totalVoters: {
    type: Number,
    default: 0,
  },
  options: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Option',
    },
  ],
  like: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'active', 'closed'],
    default: 'pending',
  },
}, {
  versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
        virtuals: true
    },
});

pollSchema.pre(/^find/, function(next) {
  (this as IPoll).populate([
    {
      path: 'createdBy',
      select: 'name avatar',
    },
    {
      path: 'like',
      select: 'name avatar',
    },
    {
      path: 'comments',
      select: 'content createdTime',
    },
    {
      path: 'options',
      select: 'title imageUrl',
      populate: {
        path: 'voters',
        select: 'name avatar',
      },
    },
  ]);
  next();
});


export default model<IPoll>('Poll', pollSchema);
