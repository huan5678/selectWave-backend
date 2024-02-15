import { RequestHandler, Response } from 'express';
import { Poll, Option } from '@/models';
import { appError, successHandle } from '@/utils';

class OptionController {
  // 投票
  public static vote: RequestHandler = async (req, res: Response ) => {
    try {
      const { optionId, userId } = req.body;

      // 檢查是否已經投過票
      const option = await Option.findById(optionId);
      if (!option) {
        throw appError({ code: 404, message: '找不到選項' });
      }
      if (option?.voters.find((voter) => voter && voter.userId && voter.userId === userId)) {
        throw appError({ code: 400, message: '您已經對此選項投過票' });
      }
      // 添加投票者
      option.voters.push({ userId, createdTime: new Date() });
      Poll.updateOne({ options: optionId }, { $inc: { totalVoters: 1 } });
      const updatedOption = await option.save();

      successHandle(res, '投票成功', { updatedOption });
    } catch (error) {
      appError({ code: 500, message: '投票失敗' });
    }
  };

  // 更改投票
  public static updateVote: RequestHandler = async (req, res: Response ) => {
    try {
      const { optionId, userId, newOptionId } = req.body;

      // 檢查是否已經投過票
      const option = await Option.findById(optionId);
      if (!option) {
        throw appError({ code: 404, message: '找不到選項' });
      }
      const voter = option?.voters.find(
        (voter) => voter && voter.userId && voter.userId === userId,
      );
      if (!voter) {
        throw appError({ code: 400, message: '找不到投票者' });
      }

      option.voters = option.voters.filter((voter) => voter.userId !== userId);

      const newOption = await Option.findById(newOptionId);
      if (!newOption) {
        throw appError({ code: 404, message: '找不到新投票選項' });
      }
      newOption.voters.push({ userId, createdTime: new Date() });
      await option.save();
      const updatedNewOption = await newOption.save();

      successHandle(res, '更改投票成功', { updatedNewOption });
    } catch (error) {
      appError({ code: 500, message: '更改投票失敗' });
    }
  };

  // 取消投票
  public static cancelVote: RequestHandler = async (req, res: Response ) => {
    try {
      const { optionId, userId } = req.body;
      const option = await Option.findById(optionId);
      if (!option) {
        throw appError({ code: 404, message: '找不到選項' });
      }
      if (!option.voters.find((voter) => voter && voter.userId && voter.userId === userId)) {
        throw appError({ code: 400, message: '您尚未對此選項投票' });
      }
      // 移除投票者
      option.voters = option.voters.filter(
        (voter) => voter && voter.userId && voter.userId.toString() !== userId,
      );
      await option.save();

      // 更新 Poll 的 totalVoters
      const poll = await Poll.findById(option.pollId);
      if (poll) {
        poll.totalVoters -= 1;
        await poll.save();
      }

      successHandle(res, '取消投票成功', {});
    } catch (error) {
      appError({ code: 500, message: '取消投票失敗' });
    }
  };

  // 新增選項
  public static createOption: RequestHandler = async (req, res: Response ) => {
    try {
      const { pollId, optionData } = req.body;
      const newOption = await Option.create({ ...optionData, pollId });
      successHandle(res, '新增選項成功', { newOption });
    } catch (error) {
      appError({ code: 500, message: '新增選項失敗' });
    }
  };

  // 更新選項
  public static updateOption: RequestHandler = async (req, res: Response ) => {
    try {
      const { optionId, updateData } = req.body;
      const updatedOption = await Option.findByIdAndUpdate(optionId, updateData, { new: true });
      if (!updatedOption) {
        throw appError({ code: 404, message: '找不到選項' });
      }
      successHandle(res, '更新選項成功', { updatedOption });
    } catch (error) {
      appError({ code: 500, message: '更新選項失敗' });
    }
  };

  // 刪除選項
  public static deleteOption: RequestHandler = async (req, res: Response ) => {
    try {
      const { id } = req.params;
      const deletedOption = await Option.findByIdAndDelete(id);
      if (!deletedOption) {
        throw appError({ code: 404, message: '找不到選項' });
      }
      successHandle(res, '刪除選項成功', { deletedOption });
    } catch (error) {
      appError({ code: 500, message: '刪除選項失敗' });
    }
  };

  // 管理投票者
  // public static manageVoters: RequestHandler = async (req, res ) => {
  //   // 這裡可以實現添加或刪除投票者的邏輯
  // };
}

export default OptionController;
