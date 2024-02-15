import { Response } from 'express'; // Import missing modules

import { Poll, Option } from '@/models';
import { appError, successHandle } from '@/utils';

class PollController {
  // 創建新投票
  public static createPoll = async (req, res: Response) => {
    try {
      const { title, description, imageUrl, tags, userId, optionsData } = req.body;

      const newPoll = await Poll.create({ title, description, imageUrl, tags, createdBy: userId });

      // 建立 Option 資料
      const optionInstances = await Promise.all(
        optionsData.map((optionData) => Option.create({ ...optionData, pollId: newPoll._id })),
      );
      newPoll.options = optionInstances.map((option) => option._id);
      await newPoll.save();

      successHandle(res, '投票創建成功', { newPoll });
    } catch (error) {
      throw new appError({ code: 500, message: '投票創建失敗' });
    }
  };

  // 獲取所有投票
  public static getAllPolls = async (req, res: Response) => {
    try {
      let { page = 1, limit = 10 } = req.query;

      // 轉換為數字並進行合理性檢查
      page = Math.max(Number(page), 1); // 確保頁碼至少為1
      limit = Math.max(Number(limit), 1); // 確保每頁至少有1條記錄

      const skip = (page - 1) * limit;
      const polls = await Poll.find()
        .select(['title', 'imageUrl', 'tags', 'endDate', 'isPrivate', 'totalVoters'])
        .skip(skip)
        .limit(limit)
        .lean();

      // 可以選擇性地添加總記錄數
      const total = await Poll.countDocuments();

      successHandle(res, '獲取投票列表成功', { polls, total, page, limit });
    } catch (error) {
      throw new appError({ code: 500, message: '獲取投票列表失敗' });
    }
  };

  // 根據 ID 獲取投票詳情
  public static getPollById = async (req, res: Response) => {
    try {
      const { pollId } = req.params;
      const poll = await Poll.findById(pollId)
        .populate('options')
        .populate('createdBy')
        .populate('comments')
        .lean();
      if (!poll) {
        throw new appError({ code: 404, message: '找不到該投票資訊，請檢查ID是否正確' });
      }
      successHandle(res, '獲取投票詳細資訊成功', { poll });
    } catch (error) {
      throw new appError({ code: 500, message: '獲取投票詳細資訊失敗' });
    }
  };

  // 更新投票資訊
  public static updatePoll = async (req, res: Response) => {
    try {
      const { pollId, updateData } = req.body;
      const updatedPoll = await Poll.findByIdAndUpdate(pollId, updateData, { new: true });
      if (!updatedPoll) {
        throw new appError({ code: 404, message: '找不到該筆投票' });
      }
      successHandle(res, '更新投票資訊成功', { updatedPoll });
    } catch (error) {
      throw new appError({ code: 500, message: '更新投票失敗資訊' });
    }
  };

  // 刪除投票
  public static deletePoll = async (req, res: Response) => {
    try {
      const { pollId } = req.params;
      const deletedPoll = await Poll.findByIdAndDelete(pollId);
      if (!deletedPoll) {
        throw new appError({ code: 404, message: '找不到投票' });
      }
      successHandle(res, '刪除投票成功', {});
    } catch (error) {
      throw new appError({ code: 500, message: '刪除投票失敗' });
    }
  };
}

export default PollController;
