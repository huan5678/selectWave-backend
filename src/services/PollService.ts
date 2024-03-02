import { Poll, Vote, User } from "@/models";
import { CreatePollRequest, IPoll, IUser, IVote } from "@/types";
import { appError, Logger } from "@/utils";
import { NextFunction } from "express";
import { FilterQuery } from "mongoose";

type poulateOptions = {
  path: string;
  select?: string;
  populate?: {
    path: string;
    select: string;
  };
};

export class PollService {
  static countDocuments = async (query: FilterQuery<IPoll>) =>
    Poll.countDocuments(query).exec();

  static createPoll = async (data: CreatePollRequest) => {
    const poll = await Poll.create(data);
    return poll;
  };

  static getPolls = async (
    queryConditions: FilterQuery<IPoll>,
    sort: string,
    skip: number,
    limit: number
  ) => {
    return await Poll.find(queryConditions)
      .sort(sort || { createdAt: -1 })
      .select("-comments -options")
      .skip(skip)
      .limit(limit)
      .exec();
  };

  static getPoll = async ({
    id,
    populates = [],
    next,
  }: {
    id: string;
    populates?: poulateOptions[];
    next?: NextFunction;
  }) => {
    const poll = await Poll.findById(id)
      .populate(populates as poulateOptions[])
      .exec();
    if (!poll) {
      throw appError({
        code: 404,
        message: "找不到提案資訊請確認 ID 是否正確",
        next,
      });
    }
    return poll;
  };

  static checkPollStartVote = async (optionId: string, next: NextFunction) =>
  {
    const poll = await Poll.findOne({ options: optionId }).exec();
    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }

    if (poll.status !== "active") {
      throw appError({ code: 400, message: "投票未開始或是已結束", next });
    }

    return poll;
  }

  static deletePoll = async (id: string, next: NextFunction) => {
    const poll = await Poll.findById(id).exec();
    if (!poll) {
      throw appError({
        code: 404,
        message: "找不到提案資訊請確認 ID 是否正確",
        next,
      });
    }
    await Poll.findByIdAndDelete(id).exec();
  };

  static likePoll = async (
    pollId: string,
    userId: string,
    next: NextFunction
  ) => {
    const poll = await Poll.findById(pollId).exec();
    if (!poll) {
      throw appError({
        code: 404,
        message: "找不到提案資訊請確認 ID 是否正確",
        next,
      });
    }
    const user = await User.findById(userId).exec();

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    const existingFollower = poll.like.find((like) => {
      return like.user.toString() === userId;
    });

    if (existingFollower) {
      throw appError({ code: 400, message: "您已經喜歡過此投票", next });
    }
    const result = await Poll.findOneAndUpdate(
      { id: pollId },
      { $push: { like: { user } } },
      { new: true }
    )
      .populate("like.user", { name: 1, avatar: 1 })
      .exec();
    await User.findOneAndUpdate(
      { id: userId },
      { $push: { likedPolls: { poll } } },
      { new: true }
    ).exec();
    return result;
  };

  static unlikePoll = async (
    pollId: string,
    userId: string,
    next: NextFunction
  ) => {
    const poll = await Poll.findById(pollId).exec();
    const user = (await User.findById(userId).exec()) as IUser;

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    const existingFollower = poll.like.find(
      (like) => like.user.toString() === user.id
    );
    if (!existingFollower) {
      throw appError({ code: 400, message: "您尚未喜歡過此投票", next });
    }
    const result = await Poll.findOneAndUpdate(
      { id: pollId },
      { $pull: { like: { user } } },
      { new: true }
    )
      .populate("like.user", "name avatar")
      .exec();
    await User.findOneAndUpdate(
      { id: userId },
      { $pull: { likedPolls: { poll } } }
    ).exec();
    return result;
  };

  static startPollCheckService = async () => {
    Logger.log("Checking polls...", "INFO");
    const now = new Date();

    await Poll.find({ startDate: { $lte: now }, status: "pending" })
      .where("status", "active")
      .updateMany({ status: "active" });

    const totalPollsActivated = await Poll.countDocuments({ status: "active" });

    Logger.log(`目前有 ${totalPollsActivated} 筆投票正在進行中`, "INFO");

    await Poll.find({ endDate: { $lte: now }, status: "active" })
      .where("status", "ended")
      .updateMany({ status: "ended" });

    const pollsToEnd = await Poll.find({
      endDate: { $lte: now },
      status: "ended",
    });

    for (let poll of pollsToEnd) {
      await this.calculateResultsForPoll(poll._id.toString());
    }
    const totalPollsToEnd = await Poll.countDocuments({ status: "closed" });

    Logger.log(`目前有 ${totalPollsToEnd} 筆投票已經結束`, "INFO");
  };

  static startPoll = async (id: string, req, next: NextFunction) => {
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
  };

  static endPoll = async (id: string, userId: string, next: NextFunction) => {
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
  };

  static calculateResultsForPoll = async (id: string) => {
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

    const winnerUpdates =
      winnerVotes.length > 0
        ? winnerVotes.map((winner) => ({
            option: winner._id,
          }))
        : [];

    poll.isWinner = winnerUpdates;
    poll.status = "closed"; // Ensure the poll is closed regardless of votes
    await poll.save();

    return poll;
  };
}

export default PollService;
