import { RequestHandler, Response } from 'express'; // Import missing modules

import { Poll, Option } from '@/models';
import { appError, successHandle } from '@/utils';
import { array, object, string } from 'yup';
import { IOption, IUser } from '@/types';

const pollSchema = object({
  title: string().required('請輸入投票標題').min(1, '投票標題至少需要1個字').max(50, '投票標題最多只能50個字'),
  description: string(),
  imageUrl: string(),
  tags: array().of(string()),
  optionsData: array()
    .of(
      object({
        title: string().required('請輸入選項標題').min(1, '選項標題至少需要1個字').max(50, '選項標題最多只能50個字'),
        imageUrl: string(),
      }),
    )
});
class PollController {
  // 創建新投票
  public static createPoll: RequestHandler = async (req: any, res: Response, next) =>
  {
    // 驗證請求的資料是否符合規範
    const validationResult = await pollSchema.validate(req.body).catch((err) => {
      throw appError({ code: 400, message: err.errors.join(', '), next });
    });
    if (!validationResult) {
      throw appError({ code: 400, message: '請確實填寫投票資訊', next});
    }
      const { title, description, imageUrl, tags, optionsData } = req.body;

      const newPoll = await Poll.create({ title, description, imageUrl, tags, createdBy: req.user._id});

      // 建立 Option 資料
      const optionInstances = await Promise.all(
        optionsData.map((optionData) => Option.create({ ...optionData, pollId: newPoll.id })),
      );
      newPoll.options = optionInstances.map((option) => option._id);
    await newPoll.save();
    const poll = await Poll.findById(newPoll.id)
      .populate('createdBy', 'name avatar')
      .populate('options', 'title imageUrl')
      .lean();

      successHandle(res, '投票創建成功', { poll });
  };

  // 獲取所有投票
  public static getAllPolls: RequestHandler = async (req, res: Response) => {
      let { page = 1, limit = 10 } = req.query;

      // 轉換為數字並進行合理性檢查
      page = Math.max(Number(page), 1); // 確保頁碼至少為1
      limit = Math.max(Number(limit), 1); // 確保每頁至少有1條記錄

      const skip = (page - 1) * limit;
      const polls = await Poll.find()
        .skip(skip)
        .limit(limit)
        .lean();

      // 可以選擇性地添加總記錄數
      const total = await Poll.countDocuments();

      successHandle(res, '獲取投票列表成功', { polls, total, page, limit });
  };

  // 根據 ID 獲取投票詳情
  public static getPollById: RequestHandler = async (req, res: Response, next) => {
      const { pollId } = req.params;
      const poll = await Poll.findById(pollId)
        .populate('options')
        .populate('createdBy')
        .populate('comments')
        .lean();
      if (!poll) {
        throw appError({ code: 404, message: '找不到該投票資訊，請檢查ID是否正確', next });
      }
      successHandle(res, '獲取投票詳細資訊成功', { poll });
  };

  // 更新投票資訊
  public static updatePoll: RequestHandler = async (req, res: Response, next) =>
  {
    const { id } = req.params;
    const validationResult = await pollSchema.validate(req.body).catch((err) => {
      throw appError({ code: 400, message: err.errors.join(', '), next });
    });
    if (!validationResult) {
      throw appError({ code: 400, message: '請確實填寫投票資訊', next});
    }

    const updatedPoll = await Poll.findById(id);
    if (!updatedPoll) {
      throw appError({ code: 404, message: '找不到該投票資訊，請檢查ID是否正確', next });
    }

    Object.assign(updatedPoll, req.body);
    await updatedPoll.save();

    if (req.body.optionsData) {
      for (const optionData of req.body.optionsData) {
        let option = await Option.findOne({ pollId: id, title: optionData.title });
        if (!option) {
          option = await Option.create({
            title: optionData.title,
            imageUrl: optionData.imageUrl,
            pollId: id,
          });
          updatedPoll.options.push(option._id);
        }
      }
      await updatedPoll.save();
    }

    const populatedPoll = await Poll.findById(id)
      .populate('createdBy', 'name avatar')
      .populate('options')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'name avatar' }
      });

    successHandle(res, '更新投票資訊成功', { populatedPoll });
  };

  // 刪除投票
  public static deletePoll: RequestHandler = async (req, res: Response, next) => {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) {
      throw appError({ code: 404, message: '找不到投票', next });
    }
    const options = await Option.find({ pollId: id });
    await Promise.all(options.map((option) => option.deleteOne()));
    await poll.deleteOne();
    successHandle(res, '刪除投票成功', {});
  };

  // 喜歡投票
  public static likePoll: RequestHandler = async (req, res: Response, next) => {
    const { id } = req.user as IUser;
    const { pollId } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw appError({ code: 404, message: '找不到投票', next });
    }
    if (poll.like.includes({ userId: id })) {
      throw appError({ code: 400, message: '您已經喜歡過此投票', next });
    }
    poll.like.push({ userId: id });
    await poll.save();
    successHandle(res, '喜歡投票成功', {});
  };

  // 取消喜歡投票
  public static unlikePoll: RequestHandler = async (req, res: Response, next) =>
  {
    const { id } = req.user as IUser;
    const { pollId } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw appError({ code: 404, message: '找不到投票', next });
    }
    if (!poll.like.includes({ userId: id })) {
      throw appError({ code: 400, message: '您尚未喜歡過此投票', next });
    }
    poll.like = poll.like.filter((like) => like.userId !== id);
    await poll.save();
    successHandle(res, '取消喜歡投票成功', {});
  };

  // 開始投票
  public static startPoll: RequestHandler = async (req, res: Response, next) => {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) {
      throw appError({ code: 404, message: '找不到投票', next });
    }
    if (poll.status === 'active') {
      throw appError({ code: 400, message: '投票已經開始', next });
    }
    poll.status = 'active';
    await poll.save();
    successHandle(res, '開始投票成功', {result: poll});
  };

  public static calculateResultsForPoll = async (id: string) => {
    const poll = await Poll.findById(id);
    if (!poll) return;
    if (poll.status !== 'active') return;

    poll.status = 'closed';
    await poll.save();

    const options = await Option.find({ pollId: id });

    let maxVotes = 0;
    let winners = [] as IOption[];

    options.forEach(option => {
        const votesCount = option.voters.length;
        if (votesCount > maxVotes) {
            winners = [option];
            maxVotes = votesCount;
        } else if (votesCount === maxVotes) {
            winners.push(option);
        }
    });

    winners.forEach(async (winner) => {
        winner.isWinner = true;
        await winner.save();
    });
  }
  // 結束投票
  public static endPoll: RequestHandler = async (req, res: Response, next) => {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) {
      throw appError({ code: 404, message: '找不到投票', next });
    }
    if (poll.status === 'pending') {
      throw appError({ code: 400, message: '投票未開始無法結束', next });
    }
    if (poll.status === 'closed') {
      throw appError({ code: 400, message: '投票已經結束', next });
    }

    const options = await Option.find({ pollId: id });
    let maxVotes = 0;
    let winners = [] as IOption[];

    options.forEach(option => {
        const votesCount = option.voters.length;
        if (votesCount > maxVotes) {
            winners = [option];
            maxVotes = votesCount;
        } else if (votesCount === maxVotes) {
            winners.push(option);
        }
    });

    winners.forEach(async (winner) => {
        winner.isWinner = true;
        await winner.save();
    });

    poll.status = 'closed';
    await poll.save();

    successHandle(res, '結束投票成功', {result: poll});
  };
}

export default PollController;
