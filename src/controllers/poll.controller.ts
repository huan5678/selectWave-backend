import { NextFunction, RequestHandler, Response } from "express"; // Import missing modules
import { appError, processDate, successHandle } from "@/utils";
import { array, boolean, object, string } from "yup";
import { IVote, IUser, IOption, CreatePollRequest } from "@/types";
import { CommentService, PollService, TagService, VoteService } from "@/services";
import { Schema } from "mongoose";

const pollSchema = object({
  title: string()
    .required("請輸入投票標題")
    .min(1, "投票標題至少需要1個字")
    .max(50, "投票標題最多只能50個字"),
  description: string(),
  imageUrl: string(),
  tags: array().of(string()),
  options: array().of(
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
  options: array().of(
    object({
      id: string(),
      title: string()
        .min(1, "選項標題至少需要1個字")
        .max(50, "選項標題最多只能50個字"),
      imageUrl: string(),
    })
  ),
  isPrivate: boolean(),
  status: string(),
});

class PollController {
  // 創建新投票
  public static createPoll = async (
    req: Request & { body: CreatePollRequest; user: IUser },
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
      options,
      startDate: clientStartDate,
      endDate: clientEndDate,
      isPrivate,
      status,
    } = req.body;

    const now = new Date();

    let startDate = clientStartDate && new Date(clientStartDate as Date);
    let endDate = clientEndDate && new Date(clientEndDate as Date);

    if (status === "active" || (startDate && startDate < now)) {
      startDate = processDate(now);
    }

    if (endDate && startDate && (endDate < startDate || endDate < now)) {
      endDate = processDate(now, true);
    }

    let isStartNow = false;

    if (status === "active")
      isStartNow = true;

    const tagInstances =
      tags && (await TagService.createMultipleTags(tags as string[]));

    const newPoll = await PollService.createPoll({
      title,
      description,
      imageUrl,
      tags: tagInstances && tagInstances.map((tag) => tag.id),
      createdBy: req.user.id,
      isPrivate,
      startDate: startDate ? startDate : isStartNow ? now : null,
      endDate: endDate ? endDate : null,
      status: status ? status : isStartNow ? "active" : "pending",
    });

    // 建立 Vote 資料
    const optionInstances = await VoteService.createOptions(
      options as IOption[],
      newPoll.id
    );
    newPoll.options = optionInstances.map((option) => option.id);
    await newPoll.save();
    const populates = [
      { path: "createdBy", select: "name avatar" },
      { path: "options", select: "title imageUrl" },
    ];
    const poll = await PollService.getPoll({ id: newPoll.id, populates, next });

    successHandle(res, "投票創建成功", { poll });
  };

  // 獲取所有投票
  public static getAllPolls: RequestHandler = async (req, res: Response) => {
    let { page = 1, limit = 12, status, q, sort, createdBy } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.max(Number(limit), 1);

    async function getMatchingTagIds(q: string): Promise<Schema.Types.ObjectId[]> {
      const tags = await TagService.findTags({ name: { $regex: q, $options: "i" } });
      return tags.map((tag) => tag._id);
    }

    const queryConditions = {
      ...(q && {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { tags: { $in: await getMatchingTagIds(q as string) } },
        ],
      }),
      ...(status && { status: status }),
      ...(createdBy && { createdBy: createdBy }),
    };

    const total = await PollService.countDocuments(queryConditions);

    const totalPages = Math.max(Math.ceil(total / limit), 1); // 計算總頁數

    page = Math.min(page, totalPages); // 確保請求的頁數不會超過總頁數

    const skip = (page - 1) * limit;

    const polls = await PollService.getPolls(
      queryConditions,
      sort as string,
      skip,
      limit
    );

    successHandle(res, "獲取投票列表成功", { polls, total, page, totalPages, limit });
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
      populates: [
        { path: "createdBy" },
        { path: "options" },
        { path: "like", select: "name avatar" },
        { path: "comments.comment", select: "content author createdTime edited updateTime" },
        {
          path: "isWinner.option",
          select: "title imageUrl",
          populate: { path: "voters.user", select: "name avatar" },
        },
      ],
      next,
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
    {
      console.log('err', err);
      throw appError({ code: 400, message: err.errors.join(", "), next });
    });
    console.log('check');

    const poll = await PollService.getPoll({ id, next });

    if (poll.createdBy.id !== userId) {
      throw appError({ code: 403, message: "您無法更新該投票", next });
    }

    if (poll.status !== "pending") {
      throw appError({
        code: 400,
        message: "投票已經開始或是結束，無法更新",
        next,
      });
    }

    const {
      title,
      description,
      imageUrl,
      tags,
      options,
      startDate: clientStartDate,
      endDate: clientEndDate,
      isPrivate,
      status,
    } = req.body;

    const tagInstances =
      tags && (await TagService.createMultipleTags(tags as string[]));
    const tagIds = tagInstances.map(tag => tag._id);

    const now = new Date();

    // 更新投票主體
    poll.title = title ?? poll.title;
    poll.description = description ?? poll.description;
    poll.imageUrl = imageUrl ?? poll.imageUrl;
    poll.tags = tagIds ?? poll.tags;
    poll.startDate = (clientStartDate && new Date(clientStartDate) < now ? processDate(clientStartDate) : clientStartDate) ?? poll.startDate;
    poll.endDate = (clientEndDate && new Date(clientEndDate) < now ? processDate(clientEndDate, true) : clientEndDate) ?? poll.endDate;
    poll.isPrivate = isPrivate ?? poll.isPrivate;
    poll.status = status ?? poll.status;

    await poll.save();

    // 處理選項更新
    if (options && options.length > 0) {
      const updatedOptions = await VoteService.updateOption(
        poll._id,
        options
      );

      poll.options = updatedOptions.map((option) => option?.id as IVote["_id"]);
      await poll.updateOne(poll).exec();
    }

    const result = await PollService.getPoll({
      id,
      populates: [
        { path: "createdBy", select: "name avatar" },
        { path: "options", select: "title imageUrl" },
      ],
      next,
    });

    successHandle(res, "投票更新成功", { result });
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

    updatedPoll.populate([
      {
        path: "options",
        select: "title imageUrl voters",
      },
      {
        path: "createdBy",
        select: "name avatar",
      },
      {
        path: "isWinner.option",
        select: "title",
      },
    ]);
    successHandle(res, "結束投票成功", { result: updatedPoll });
  };

  // 獲取提案中使用者所有評論
  public static getCommentsByUser: RequestHandler = async (
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    const {id: userId} = req.user as IUser;
    const comments = await CommentService.getCommentByPollAndUser(id, userId, next);
    successHandle(res, "獲取使用者評論成功", { result: comments });
  };

  public static getCommentsByPoll: RequestHandler = async(
    req,
    res: Response,
    next
  ) => {
    const { id } = req.params;
    if (!id) {
      throw appError({ code: 400, message: "請提供投票 ID", next });
    }
    const comments = await CommentService.getCommentsByPoll(id, next);
    successHandle(res, "獲取投票評論成功", { result: comments });
  }
}

export default PollController;
