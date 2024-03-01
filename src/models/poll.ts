import { Schema, model } from 'mongoose';
import customEmitter from '@/utils';
import { IPoll } from '@/types';
import { Tag } from '@/models';


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
      type: Schema.Types.ObjectId,
      ref: 'Tag',
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

  if (this.isNew || this.isModified('tags')) {
    const currentTags = this.tags;
    const previousTags = this.modifiedPaths().includes('tags') ? this._id.tags : [];
    
    // 計算新增和移除的標籤
    const addedTags = currentTags.filter(tag => !previousTags.includes(tag));
    const removedTags = previousTags.filter(tag => !currentTags.includes(tag));

    // 增加新關聯標籤的 usageCount
    if (addedTags.length > 0) {
      await Tag.updateMany({ _id: { $in: addedTags } }, { $inc: { usageCount: 1 } });
    }

    // 減少移除標籤的 usageCount
    if (removedTags.length > 0) {
      await Tag.updateMany({ _id: { $in: removedTags } }, { $inc: { usageCount: -1 } });
    }
  }
  next();
});

pollSchema.post('save', async function() {
  customEmitter.emit('pollUpdated', {
    pollId: this._id,
    totalVoters: this.totalVoters,
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
  );
  (this as IPoll).populate(
    {
      path: 'tags',
      select: 'name'
    }
  );
  next();
});

pollSchema.pre(/^remove/, async function(next) {
  // 減少所有關聯標籤的 usageCount
  await Tag.updateMany(
    { _id: { $in: (this as IPoll).tags } },
    { $inc: { usageCount: -1 } }
  );
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
