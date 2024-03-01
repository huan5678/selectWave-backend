import { RequestHandler, Response } from "express"; // Import missing modules
import { Poll, Vote, User } from "@/models";
import { appError, successHandle } from "@/utils";
import { array, boolean, date, object, string } from "yup";
import { IVote, IPoll, IUser, IOption, CreatePollRequest } from "@/types";

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
    })
  ),
});

const updatePollSchema = object({
  title: string()
    .min(1, "投票標題至少需要1個字")
    .max(50, "投票標題最多只能50個字"),
  description: string(),
  imageUrl: string(),
  tags: array().of(string()),
  optionsData: array().of(
    object({
      id: string(),
      title: string()
        .min(1, "選項標題至少需要1個字")
        .max(50, "選項標題最多只能50個字"),
      imageUrl: string(),
    })
  ),
  startDate: date(),
  endDate: date(),
  isPrivate: boolean(),
  status: string(),
});

const dateSchema = date()
  .required("請輸入日期")
  .test("date-validation", "日期應該晚於當前時間", function (value) {
    return new Date(value) > new Date();
  });

class PollController {
  // 創建新投票
  public static createPoll = async (
    req: Request & { body: CreatePollRequest, user: IUser },
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
    const {
      title,
      description,
      imageUrl,
      tags,
      optionsData,
      startDate,
      endDate,
      isPrivate,
      status,
    } = req.body;

    [
      [startDate, endDate].map(
        async (date) =>
          date &&
          (await dateSchema.validate(date).catch((err) => {
            throw appError({ code: 400, message: err.errors.join(", "), next });
          }))
      ),
    ];

    const now = new Date();

    if (status !== "active" && startDate && new Date(startDate) < now) {
      throw appError({ code: 400, message: "開始時間不能早於當前時間", next });
    }

    if (
      (endDate && startDate && new Date(endDate) < new Date(startDate)) ||
      (endDate && new Date(endDate) < now)
    ) {
      throw appError({
        code: 400,
        message: "結束時間不能早於開始時間或當前時間",
        next,
      });
    }

    if (status === "active" && endDate && new Date(endDate) < now) {
      throw appError({ code: 400, message: "結束時間不能早於當前時間", next });
    }

    let isStartNow = false;

    if ((startDate && new Date(startDate) < now) || status === "active")
      isStartNow = true;

    const newPoll = await Poll.create({
      title,
      description,
      imageUrl,
      tags,
      createdBy: req.user.id,
      isPrivate,
      startDate: startDate ? new Date(startDate) : isStartNow ? now : null,
      endDate: endDate ? new Date(endDate) : null,
      status: status ? status : isStartNow ? "active" : "pending",
    });

    // 建立 Vote 資料
    const optionInstances = await Promise.all(
      optionsData.map((optionData) =>
        Vote.create({ ...optionData, pollId: newPoll.id })
      )
    );
    newPoll.options = optionInstances.map((option) => option.id);
    await newPoll.save();
    const poll = await Poll.findById(newPoll.id)
      .populate("createdBy", "name avatar")
      .populate("options", "title imageUrl")
      .exec();

    successHandle(res, "投票創建成功", { poll });
  };

  // 獲取所有投票
  public static getAllPolls: RequestHandler = async (req, res: Response) => {
    let { page = 1, limit = 10, status, q, sort, createdBy } = req.query;

    // 轉換為數字並進行合理性檢查
    page = Math.max(Number(page), 1); // 確保頁碼至少為1
    limit = Math.max(Number(limit), 1); // 確保每頁至少有1條記錄

    const skip = (page - 1) * limit;

    const queryConditions = {
        ...(q && {
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { tags: { $in: [q] } },
            ],
        }),
        ...(status && { status: status }),
        ...(createdBy && { createdBy: createdBy }),
    };

    const polls = await Poll.find(queryConditions)
      .sort(sort as string || { createdAt: -1 })
      .select("-comments -options")
      .skip(skip)
      .limit(limit)
      .exec();

    // 可以選擇性地添加總記錄數
    const total = await Poll.countDocuments(queryConditions);

    successHandle(res, "獲取投票列表成功", { polls, total, page, limit });
  };

  // 根據 ID 獲取投票詳情
  public static getPollById: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
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
  public static updatePoll: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;
    const poll = await Poll.findById(id).exec();

    
    if (!poll) {
      throw appError({
        code: 404,
        message: "找不到該投票資訊，請檢查ID是否正確",
        next,
      });
    }
    
    if (poll.createdBy.id !== userId) {
      throw appError({ code: 403, message: "您無法更新該投票", next });
    }
    
    if (poll.status === "closed" || poll.status === "ended") {
      throw appError({ code: 400, message: "投票已經結束，無法更新", next });
    }

    // 驗證更新資料
    await updatePollSchema
      .validate(req.body)
      .catch((err) =>
        appError({ code: 400, message: err.errors.join(", "), next })
      );

    const {
      title,
      description,
      imageUrl,
      tags,
      optionsData,
      startDate,
      endDate,
      isPrivate,
      status,
    } = req.body;

    // 更新投票主體
    poll.title = title ?? poll.title;
    poll.description = description ?? poll.description;
    poll.imageUrl = imageUrl ?? poll.imageUrl;
    poll.tags = tags ?? poll.tags;
    poll.startDate = startDate ?? poll.startDate;
    poll.endDate = endDate ?? poll.endDate;
    poll.isPrivate = isPrivate ?? poll.isPrivate;
    poll.status = status ?? poll.status;

    await poll.updateOne(poll).exec();

    // 處理選項更新
    if (optionsData && optionsData.length > 0) {
      // 使用 map 來迭代每一個選項數據
      const updatedOptions = optionsData.map(async (optionData: IOption) => {
        // 檢查是否包含 id，如果有 id 則更新
        if (optionData.id) {
          return await Vote.findByIdAndUpdate(
            optionData.id,
            {
              $set: {
                title: optionData.title,
                // 更新其他需要更新的欄位
                imageUrl: optionData.imageUrl ?? null, // 這是一個示例，根據實際情況可能需要調整
              },
            },
            { new: true }
          ); // { new: true } 確保返回的是更新後的文檔
        } else {
          // 沒有 id 則新增選項
          return await Vote.create({
            ...optionData,
            pollId: poll?.id,
          });
        }
      });

      // 等待所有選項的更新或新增完成
      const optionsResult = await Promise.all(updatedOptions);

      // 更新 poll 文檔中的 options 陣列
      poll.options = optionsResult.map((option) => option.id);
      await poll.updateOne(poll).exec();
    }

    // 重新加載更新後的投票資訊，包括關聯的選項等
    const result = await Poll.findById(poll.id)
      .populate("options", "title imageUrl")
      .populate("createdBy", "name email");

    successHandle(res, "投票更新成功", {result});
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
    const options = await Vote.find({ pollId: id });
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
      { id: pollId },
      { $push: { like: { user } } },
      { new: true }
    )
      .populate("like.user", { name: 1, avatar: 1 })
      .exec();
    await User.findOneAndUpdate(
      { id: id },
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
      { id: pollId },
      { $pull: { like: { user } } },
      { new: true }
    )
      .populate("like.user", "name avatar")
      .exec();
    await User.findOneAndUpdate(
      { id: id },
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

  const options = await Vote.find({ pollId: id }).exec();
  let maxVotes = 0;
  let winnerVotes = [] as IVote[];

  options.forEach((option) => {
    const votesCount = option.voters.length;
    if (votesCount > maxVotes) {
      winnerVotes = [option];
      maxVotes = votesCount;
    } else if (votesCount === maxVotes) {
      winnerVotes.push(option);
    }
  });

  const winnerUpdates = winnerVotes.length > 0 ? winnerVotes.map((winner) => ({
    option: winner._id,
  })) : [];

  poll.isWinner = winnerUpdates;
  poll.status = "closed"; // Ensure the poll is closed regardless of votes
  await poll.save();

  return poll;
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
    if (
      poll.status === "ended" ||
      poll.status === "closed" ||
      poll.isWinner.length > 0
    ) {
      throw appError({ code: 400, message: "投票已經結束", next });
    }

    if (poll.createdBy.id !== userId) {
      throw appError({ code: 403, message: "您無法結束該投票", next });
    }

    const updatedPoll = await PollController.calculateResultsForPoll(id);
    if (!updatedPoll) {
      throw appError({ code: 500, message: "結束投票失敗", next });
    }

    updatedPoll
      .populate([
        {
        path: "options",
        select: "title imageUrl voters",
        },{
        path: "createdBy",
        select: "name avatar",
      },{
        path: "isWinner.option",
        select: "title",
      }])
    successHandle(res, "結束投票成功", { result: updatedPoll });
  };
}

export default PollController;
