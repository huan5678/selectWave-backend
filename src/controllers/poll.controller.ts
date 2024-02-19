import { RequestHandler, Response } from "express"; // Import missing modules

import { Poll, Option, User } from "@/models";
import { appError, successHandle } from "@/utils";
import { array, object, string } from "yup";
import { IOption, IPoll, IUser } from "@/types";

const pollSchema = object({
  title: string()
    .required("請輸入投票標題")
    .min(1, "投票標題至少需要1個字")
    .max(50, "投票標題最多只能50個字"),
  description: string(),
  imageUrl: string(),
  tags: array().of(string()),
  optionsData: array().of(
    object({
      title: string()
        .required("請輸入選項標題")
        .min(1, "選項標題至少需要1個字")
        .max(50, "選項標題最多只能50個字"),
      imageUrl: string(),
    })
  ),
});
class PollController {
  // 創建新投票
  public static createPoll: RequestHandler = async (
    req: any,
    res: Response,
    next
  ) => {
    // 驗證請求的資料是否符合規範
    const validationResult = await pollSchema
      .validate(req.body)
      .catch((err) => {
        throw appError({ code: 400, message: err.errors.join(", "), next });
      });
    if (!validationResult) {
      throw appError({ code: 400, message: "請確實填寫投票資訊", next });
    }
    const { title, description, imageUrl, tags, optionsData } = req.body;

    const newPoll = await Poll.create({
      title,
      description,
      imageUrl,
      tags,
      createdBy: req.user._id,
    });

    // 建立 Option 資料
    const optionInstances = await Promise.all(
      optionsData.map((optionData) =>
        Option.create({ ...optionData, pollId: newPoll.id })
      )
    );
    newPoll.options = optionInstances.map((option) => option._id);
    await newPoll.save();
    const poll = await Poll.findById(newPoll.id)
      .populate("createdBy", "name avatar")
      .populate("options", "title imageUrl")
      .exec();

    successHandle(res, "投票創建成功", { poll });
  };

  // 獲取所有投票
  public static getAllPolls: RequestHandler = async (req, res: Response) => {
    let { page = 1, limit = 10 } = req.query;

    // 轉換為數字並進行合理性檢查
    page = Math.max(Number(page), 1); // 確保頁碼至少為1
    limit = Math.max(Number(limit), 1); // 確保每頁至少有1條記錄

    const skip = (page - 1) * limit;
    const polls = await Poll.find()
      .select("-comments -options")
      .skip(skip)
      .limit(limit)
      .exec();

    // 可以選擇性地添加總記錄數
    const total = await Poll.countDocuments();

    successHandle(res, "獲取投票列表成功", { polls, total, page, limit });
  };

  // 根據 ID 獲取投票詳情
  public static getPollById: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    console.log("pollId: ", id);
    const poll = await Poll.findById(id)
      .populate("options")
      .populate("createdBy")
      .populate({
        path: "comments.comment",
        select: "content author createdTime updatedTime edited",
      })
      .populate({
        path: "isWinner.option",
        select: "title imageUrl",
        populate: { path: "voters.user", select: "name avatar" },
      })
      .exec();
    if (!poll) {
      throw appError({
        code: 404,
        message: "找不到該投票資訊，請檢查ID是否正確",
        next,
      });
    }
    successHandle(res, "獲取投票詳細資訊成功", { poll });
  };

  // 更新投票資訊
  public static updatePoll: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    const validationResult = await pollSchema
      .validate(req.body)
      .catch((err) => {
        throw appError({ code: 400, message: err.errors.join(", "), next });
      });
    if (!validationResult) {
      throw appError({ code: 400, message: "請確實填寫投票資訊", next });
    }

    const updatedPoll = await Poll.findById(id);
    if (!updatedPoll) {
      throw appError({
        code: 404,
        message: "找不到該投票資訊，請檢查ID是否正確",
        next,
      });
    }

    Object.assign(updatedPoll, req.body);
    await updatedPoll.save();

    if (req.body.optionsData) {
      for (const optionData of req.body.optionsData) {
        let option = await Option.findOne({
          pollId: id,
          title: optionData.title,
        }).exec();
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
      .populate("createdBy", "name avatar")
      .populate("options")
      .populate({
        path: "comments",
        populate: { path: "user", select: "name avatar" },
      })
      .exec();

    successHandle(res, "更新投票資訊成功", { populatedPoll });
  };

  // 刪除投票
  public static deletePoll: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    const poll = await Poll.findById(id).exec();
    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    const options = await Option.find({ pollId: id });
    await Promise.all(options.map((option) => option.deleteOne()));
    await poll.deleteOne();
    successHandle(res, "刪除投票成功", {});
  };

  // 喜歡投票
  public static likePoll: RequestHandler = async (req, res: Response, next) => {
    const pollId = req.params.id;
    const { id } = req.user as IUser;
    const poll = (await Poll.findById(pollId)) as IPoll;
    const user = (await User.findById(id).exec()) as IUser;
    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    const existingFollower = poll.like.find((like) => {
      return like.user.toString() === user.id;
    });

    if (existingFollower) {
      throw appError({ code: 400, message: "您已經喜歡過此投票", next });
    }
    const resultPollData = await Poll.findOneAndUpdate(
      { _id: pollId },
      { $push: { like: { user } } },
      { new: true }
    )
      .populate("like.user", { name: 1, avatar: 1 })
      .exec();
    await User.findOneAndUpdate(
      { _id: id },
      { $push: { likedPolls: { poll } } },
      { new: true }
    ).exec();
    successHandle(res, "喜歡投票成功", { resultPollData });
  };

  // 取消喜歡投票
  public static unlikePoll: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.user as IUser;
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId).exec();
    const user = (await User.findById(id).exec()) as IUser;

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    const existingFollower = poll.like.find(
      (like) => like.user.toString() === user.id
    );
    if (!existingFollower) {
      throw appError({ code: 400, message: "您尚未喜歡過此投票", next });
    }
    const resultPollData = await Poll.findOneAndUpdate(
      { _id: pollId },
      { $pull: { like: { user } } },
      { new: true }
    )
      .populate("like.user", "name avatar")
      .exec();
    await User.findOneAndUpdate(
      { _id: id },
      { $pull: { likedPolls: { poll } } }
    ).exec();
    successHandle(res, "取消喜歡投票成功", { resultPollData });
  };

  // 開始投票
  public static startPoll: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    const poll = await Poll.findById(id).exec();
    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "pending") {
      throw appError({ code: 400, message: "投票已經開始或是結束", next });
    }

    if (poll.createdBy.id !== (req.user as IUser).id) {
      throw appError({ code: 403, message: "您無法開始該投票", next });
    }

    poll.status = "active";
    await poll.save();
    successHandle(res, "開始投票成功", { result: poll });
  };

  public static calculateResultsForPoll = async (id: string) => {
    const poll = await Poll.findById(id).exec();
    if (!poll) return;
    if (poll.status !== "ended") return;

    poll.status = "closed";
    await poll.save();

    const options = await Option.find({ pollId: id }).exec();
    let maxVotes = 0;
    let winnerOptions = [] as IOption[];

    options.forEach((option) => {
      const votesCount = option.voters.length;
      if (votesCount > maxVotes) {
        winnerOptions = [option];
        maxVotes = votesCount;
      } else if (votesCount === maxVotes) {
        winnerOptions.push(option);
      }
    });

    const winnerUpdates = winnerOptions.map((winner) => ({
      option: winner._id,
    }));

    return poll.updateOne({ isWinner: winnerUpdates, status: "closed" }, { new: true });
  };
  // 結束投票
  public static endPoll: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;
    const poll = (await Poll.findById(id).exec()) as IPoll;
    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status === "pending") {
      throw appError({ code: 400, message: "投票未開始無法結束", next });
    }
    if (poll.status === "ended" || poll.status === "closed" || poll.isWinner.length > 0) {
      throw appError({ code: 400, message: "投票已經結束", next });
    }

    if (poll.createdBy.id !== userId) {
      throw appError({ code: 403, message: "您無法結束該投票", next });
    }


    const updatedPoll = await PollController.calculateResultsForPoll(id);

    updatedPoll
      .populate({
        path: "options",
        select: "title imageUrl voters",
      })
      .populate({
        path: "createdBy",
        select: "name avatar",
      })
      .populate({
        path: "isWinner.option",
        select: "title",
      })
      .exec();
    successHandle(res, "結束投票成功", { result: updatedPoll });
  };
}

export default PollController;
