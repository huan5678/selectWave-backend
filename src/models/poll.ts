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
      ref: 'Vote',
    },
  ],
  like: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  comments: [
    {
      comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'closed'],
    default: 'pending',
  },
  isWinner: [
    {
      _id: false,
      option: {
        type: Schema.Types.ObjectId,
        ref: 'Vote',
      },
    },
  ],
}, {
  versionKey: false,
    timestamps: true,
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

pollSchema.pre('save', async function(next) {
  // Only proceed if options are modified or it's a new document
  if (this.isModified('options') || this.isNew) {
    const poll = this;
    const OptionModel = model('Vote');

    // Assuming `options` are the IDs of related Option documents
    const options = await OptionModel.find({
      '_id': { $in: poll.options }
    });

    let totalVoters = 0;
    options.forEach(option => {
      // Assuming each option document correctly populates the `voters` array
      totalVoters += option.voters.length;
    });

    poll.totalVoters = totalVoters;
  }
  next();
});

pollSchema.post('save', async function() {
  const wss = require('@/app').wss;
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'pollUpdate',
      pollId: this.id,
      totalVoters: this.totalVoters,
    }));
  });
});

pollSchema.pre(/^find/, function (next)
{
  (this as IPoll)
    .populate({
      path: 'createdBy',
      select: 'name avatar'
    });
  (this as IPoll).populate(
    {
      path: 'like',
      select: 'name avatar',
    });
  (this as IPoll).populate(
    {
      path: 'isWinner.option',
      select: 'title imageUrl'
    }
  )
  next();
});

// 考慮性能，只在需要時進行關聯查詢
pollSchema.virtual('optionsDetails', {
  ref: 'Vote',
  localField: 'options',
  foreignField: '_id',
});

// 索引優化
pollSchema.index({ createdBy: 1, startDate: 1, endDate: 1, status: 1 });


export default model<IPoll>('Poll', pollSchema);
