import { NextFunction, RequestHandler, Response } from "express"; // Import missing modules
import { appError, successHandle } from "@/utils";
import { array, boolean, date, object, string } from "yup";
import { IVote, IUser, IOption, CreatePollRequest } from "@/types";
import { PollService, TagService, VoteService } from "@/services";

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
    next: NextFunction
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

    const tagInstances = tags && await TagService.createMultipleTags(tags as string[]);

    const newPoll = await PollService.createPoll({
      title,
      description,
      imageUrl,
      tags: tagInstances && tagInstances.map((tag) => tag.id),
      createdBy: req.user.id,
      isPrivate,
      startDate: startDate ? new Date(startDate) : isStartNow ? now : null,
      endDate: endDate ? new Date(endDate) : null,
      status: status ? status : isStartNow ? "active" : "pending",
    });

    // 建立 Vote 資料
    const optionInstances = await VoteService.createOptions(optionsData as IOption[], newPoll.id);
    newPoll.options = optionInstances.map((option) => option.id);
    await newPoll.save();
    const populates = [
      { path: "createdBy", select: "name avatar" },
      { path: "options", select: "title imageUrl" },
    ]
    const poll = await PollService.getPoll({id: newPoll.id, populates, next});

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

    const polls = await PollService.getPolls(queryConditions, sort as string, skip, limit);

    // 可以選擇性地添加總記錄數
    const total = await PollService.countDocuments(queryConditions);

    successHandle(res, "獲取投票列表成功", { polls, total, page, limit });
  };

  // 根據 ID 獲取投票詳情
  public static getPollById: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    const poll = await PollService.getPoll({
      id,
      populates:[
        { path: "createdBy" },
        { path: "options" },
        { path: "comments.comment", select: "content author createdTime updatedTime edited" },
        { path: "isWinner.option", select: "title imageUrl", populate: { path: "voters.user", select: "name avatar" } },
    ], next
    });
    successHandle(res, "獲取投票詳細資訊成功", { poll });
  };

  // 更新投票資訊
  public static updatePoll: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;

    // 驗證更新資料
    await updatePollSchema
      .validate(req.body)
      .catch((err) =>
        appError({ code: 400, message: err.errors.join(", "), next })
    );

    const poll = await PollService.getPoll({ id, next });

    if (poll.createdBy.id !== userId) {
      throw appError({ code: 403, message: "您無法更新該投票", next });
    }

    if (poll.status !== "pending") {
      throw appError({ code: 400, message: "投票已經開始或是結束，無法更新", next });
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

    const tagInstances = tags && await TagService.createMultipleTags(tags as string[]);

    // 更新投票主體
    poll.title = title ?? poll.title;
    poll.description = description ?? poll.description;
    poll.imageUrl = imageUrl ?? poll.imageUrl;
    poll.tags = tagInstances && poll.tags && poll.tags.concat(tagInstances.map((tag) => tag.id)) || tagInstances.map((tag) => tag.id) || poll.tags || [];
    poll.startDate = startDate ?? poll.startDate;
    poll.endDate = endDate ?? poll.endDate;
    poll.isPrivate = isPrivate ?? poll.isPrivate;
    poll.status = status ?? poll.status;

    await poll.updateOne(poll).exec();

    // 處理選項更新
    if (optionsData && optionsData.length > 0) {
      const updatedOptions = await VoteService.updateOption(poll._id, optionsData);

      poll.options = updatedOptions.map((option) => option?.id as IVote["_id"]);
      await poll.updateOne(poll).exec();
    }

    const result = await PollService.getPoll({
      id, populates: [
        { path: "createdBy", select: "name avatar" },
        { path: "options", select: "title imageUrl" },
    ], next });

    successHandle(res, "投票更新成功", {result});
  };

  // 刪除投票
  public static deletePoll: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    if (!id) {
      throw appError({ code: 400, message: "請提供投票 ID", next });
    }
    await PollService.deletePoll(id, next);
    await VoteService.deleteOptionByPollId(id);
    successHandle(res, "刪除投票成功", {});
  };

  // 喜歡投票
  public static likePoll: RequestHandler = async (req, res: Response, next) => {
    const { id } = req.params;
    const { id: UserId } = req.user as IUser;
    const result = await PollService.likePoll(id, UserId, next);
    successHandle(res, "喜歡投票成功", { result });
  };

  // 取消喜歡投票
  public static unlikePoll: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;

    if (!id) {
      throw appError({ code: 400, message: "請提供投票 ID", next });
    }

    const result = await PollService.unlikePoll(id, userId, next);

    successHandle(res, "取消喜歡投票成功", { result });
  };

  // 開始投票
  public static startPoll: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    const result = await PollService.startPoll(id, req, next);

    successHandle(res, "開始投票成功", { result });
  };


  // 結束投票
  public static endPoll: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user as IUser;
    await PollService.endPoll(id, userId, next);

    const updatedPoll = await PollService.calculateResultsForPoll(id);
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
