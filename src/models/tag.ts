import { Schema, model } from "mongoose";
import { ITag } from "@/types";

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      require: [ true, "請填入標籤的名稱" ],
      minLength: [ 1, "投票標題請大於 1 個字" ],
      maxLength: [ 50, "投票標題長度過長，最多只能 50 個字" ],
      unique: true, // 標籤名稱不可重複
    },
    usageCount: {
      type: Number,
      default: 0, // 預設使用次數為 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export default model<ITag>("Tag", tagSchema);
