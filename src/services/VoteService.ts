import { Vote } from "@/models";
import { IOption, IUser } from "@/types";
import { appError } from "@/utils";
import { NextFunction } from "express";

class VoteService
{
  static createOptions = async (options: IOption[], pollId: string) => {
    return await Promise.all(
      options.map((optionData) => Vote.create({ ...optionData, pollId }))
    );
  };
  static updateOption = async (pollId: string, optionsData: IOption[]) => {
    // 使用 Promise.all 確保所有異步操作都完成
    return Promise.all(
      optionsData.map(async (optionData: IOption) => {
        // 檢查是否包含 id，如果有 id 則更新
        if (optionData.id) {
          return await Vote.findByIdAndUpdate(
            optionData.id,
            {
              $set: {
                title: optionData.title,
                imageUrl: optionData.imageUrl ?? null,
              },
            },
            { new: true } // { new: true } 確保返回的是更新後的文檔
          );
        } else {
          // 沒有 id 則新增選項
          return await Vote.create({
            ...optionData,
            pollId,
          });
        }
      })
    );
  };
  static deleteOption = async (optionId: string) => {
    return await Vote.findByIdAndDelete(optionId);
  };
  static deleteOptionByPollId = async (pollId: string) => {
    return await Vote.deleteMany({ pollId });
  };

  static getVote = async (id: string, next: NextFunction) => {
    const vote = await Vote.findById(id).exec();
    if (!vote) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    return vote;
  }

  static addVote = async (voteId: string, user: IUser) =>
  {
    const vote = await Vote.findById(voteId).exec();
    vote?.voters.push({ user: user.id, createdTime: new Date() });
    await vote?.save();
    const result = await Vote.findById(voteId)
      .populate("voters.user", "name avatar")
      .exec();
    return result;
  }

  static cancelVote = async (voteId: string, user: IUser) =>
  {
    await Vote.updateOne({ _id: voteId }, { $pull: { voters: { user: user.id } } });
    const result = await Vote.findById(voteId)
      .populate("voters.user", "name avatar")
      .exec();
    return result;
  }

  static updateVote = async (voteId: string, newVoteId: string, user: IUser) => {
    await Vote.findByIdAndUpdate(
      voteId,
      { $pull: { voters: { user: user.id } } },
      { new: true }
    );

    const updatedVote = await Vote.findByIdAndUpdate(
      newVoteId,
      { $addToSet: { voters: { user: user.id, createdTime: new Date(), updatedTime: new Date() } } },
      { new: true }
    ).populate('voters.user', 'name avatar').exec();

    return updatedVote;
    }
}

export default VoteService;
