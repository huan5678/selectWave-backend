import { RequestHandler } from 'express';
import { Poll, Option } from '@/models';
import { appError, successHandle } from '@/utils';
import { IUser } from '@/types';
import { array, object, string } from 'yup';

const optionArraySchema = array(object({
  title: string().required('請填寫選項名稱').min(1, '選項名稱請大於 1 個字').max(50, '選項名稱長度過長，最多只能 50 個字'),
  imageUrl: string().default('https://imgur.com/TECsq2J.png'),
}));

const optionSchema = object({
  title: string().required('請填寫選項名稱').min(1, '選項名稱請大於 1 個字').max(50, '選項名稱長度過長，最多只能 50 個字'),
  imageUrl: string().default('https://imgur.com/TECsq2J.png'),
});
class OptionController {
  // 投票
  public static vote: RequestHandler = async (req, res, next ) => {
      const { optionId } = req.body;
      const { id } = req.user as IUser;

      // 檢查是否已經投過票
      const option = await Option.findById(optionId);
      if (!option) {
        throw appError({ code: 404, message: '找不到選項', next });
      }
      if (option?.voters.find((voter) => voter && voter.userId && voter.userId === id)) {
        throw appError({ code: 400, message: '您已經對此選項投過票', next });
      }
      // 添加投票者
      option.voters.push({ userId: id, createdTime: new Date() });
      Poll.updateOne({ options: optionId }, { $inc: { totalVoters: 1 } });
      const updatedOption = await option.save();

      successHandle(res, '投票成功', { updatedOption });
  };

  // 更改投票
  public static updateVote: RequestHandler = async (req, res, next ) => {
      const { id } = req.user as IUser;
      const { optionId, newOptionId } = req.body;

      // 檢查是否已經投過票
      const option = await Option.findById(optionId);
      if (!option) {
        throw appError({ code: 404, message: '找不到選項', next });
      }
      const voter = option?.voters.find(
        (voter) => voter && voter.userId && voter.userId === id,
      );
      if (!voter) {
        throw appError({ code: 400, message: '找不到投票者', next });
      }

      option.voters = option.voters.filter((voter) => voter.userId !== id);

      const newOption = await Option.findById(newOptionId);
      if (!newOption) {
        throw appError({ code: 404, message: '找不到新投票選項', next });
      }
      newOption.voters.push({ userId: id, createdTime: new Date() });
      await option.save();
      const updatedNewOption = await newOption.save();

      successHandle(res, '更改投票成功', { updatedNewOption });
  };

  // 取消投票
  public static cancelVote: RequestHandler = async (req, res, next ) => {
      const {id} = req.user as IUser;
      const { optionId } = req.body;
      const option = await Option.findById(optionId);
      if (!option) {
        throw appError({ code: 404, message: '找不到選項', next});
      }
      if (!option.voters.find((voter) => voter && voter.userId && voter.userId === id)) {
        throw appError({ code: 400, message: '您尚未對此選項投票', next});
      }
      // 移除投票者
      option.voters = option.voters.filter(
        (voter) => voter && voter.userId && voter.userId.toString() !== id,
      );
      await option.save();

      // 更新 Poll 的 totalVoters
      const poll = await Poll.findById(option.pollId);
      if (poll) {
        poll.totalVoters -= 1;
        await poll.save();
      }

      successHandle(res, '取消投票成功', {});
  };

  // 新增選項
  public static createOption: RequestHandler = async (req, res, next ) => {
      const { pollId, optionData } = req.body;
      const validatorInput = await optionArraySchema.validate(optionData);
      if (!validatorInput) {
        throw appError({ code: 400, message: '請確實填寫選項資訊', next });
      }
      const newOption = await Option.create({ ...validatorInput, pollId });
      successHandle(res, '新增選項成功', { newOption });
  };

  // 更新選項
  public static updateOption: RequestHandler = async (req, res, next) =>
  {
    const { id } = req.params;
      const { updateData } = req.body;
      const validatorInput = await optionSchema.validate(updateData);
      if (!validatorInput) {
        throw appError({ code: 400, message: '請確實填寫選項資訊', next });
      }
      const updatedOption = await Option.findByIdAndUpdate(id, validatorInput, { new: true });
      if (!updatedOption) {
        throw appError({ code: 404, message: '找不到選項', next });
      }
      successHandle(res, '更新選項成功', { updatedOption });
  };

  // 刪除選項
  public static deleteOption: RequestHandler = async (req, res, next ) => {
      const { id } = req.params;
      const deletedOption = await Option.findByIdAndDelete(id);
      if (!deletedOption) {
        throw appError({ code: 404, message: '找不到選項', next });
      }
      successHandle(res, '刪除選項成功', { deletedOption });
  };

}

export default OptionController;
