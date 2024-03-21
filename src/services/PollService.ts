import { Poll, Vote, User } from "@/models";
import { CreatePollRequest, IPoll, IUser, IVote } from "@/types";
import { appError, Logger } from "@/utils";
import { modelExists, modelFindByID } from "@/utils/modelCheck";
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
      .select("-comments -options -followers -isWinner -updatedAt")
      .skip(skip)
      .limit(limit)
      .exec();
  };

  static getPoll = async ({
    id,
    populates = [],
  }: {
    id: string;
    populates?: poulateOptions[];
    }) =>
  {
    await modelFindByID("Poll", id);
    const poll = await Poll.findById(id)
      .populate(populates as poulateOptions[])
      .exec();
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

  static deletePoll = async (id: string) => {
    await modelFindByID("Poll", id);
    await Poll.findByIdAndDelete(id).exec();
  };

  static likePoll = async (
    emoji: string,
    pollId: string,
    userId: string,
  ) =>
  {
    const poll = await modelFindByID("Poll", pollId);
    const user = await User.findById(userId).exec() as IUser;
    await modelExists("Poll", pollId, userId, "like.user", '已經按讚過了', false);
    const result = await Poll.findOneAndUpdate(
      { _id: pollId },
      { $push: { like: { user: user._id, emoji } } },
      { new: true }
    )
      .populate("like.user", { name: 1, avatar: 1 })
      .exec();
    await User.findOneAndUpdate(
      { _id: userId },
      {  $addToSet:  { likedPolls: poll._id } },
      { new: true }
    ).exec();
    return result;
  };

  static updateLikePoll = async (
    emoji: string,
    pollId: string,
    userId: string,
  ) =>
  {
    await modelFindByID("Poll", pollId);
    const user = await User.findById(userId).exec() as IUser;
    const originEmoji = await Poll.findOne({ "like.user": userId }).exec();
    if (!originEmoji) {
      throw appError({ code: 404, message: "未對投票按讚" });
    }
    await modelExists("Poll", pollId, userId, "like.user", '尚未按讚過', true);
    const result = await Poll.findOneAndUpdate(
      { _id: pollId, "like.user": user._id },
      { $set: { "like.$.emoji": emoji } },
      { new: true }
    )
      .populate("like.user", "name avatar")
      .exec();
    return result;
  }

  static unlikePoll = async (
    pollId: string,
    userId: string,
  ) =>
  {
    await modelFindByID("Poll", pollId);
    const poll = await Poll.findById(pollId).exec() as IPoll;
    const user = (await User.findById(userId).exec()) as IUser;
    await modelExists("Poll", pollId, userId, "like.user", '尚未按讚過', true);
    const result = await Poll.findOneAndUpdate(
      { _id: pollId },
      { $pull: { like: { user: user._id } } },
      { new: true }
    )
      .populate("like.user", "name avatar")
      .exec();
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { likedPolls: poll._id } }
    ).exec();
    return result;
  };

  static followPoll = async (
    pollId: string,
    userId: string,
  ) =>
  {
    await modelFindByID("Poll", pollId);
    const user = (await User.findById(userId).exec()) as IUser;
    await modelExists("Poll", pollId, userId, "followers", '已經追蹤過了', false);
    const result = await Poll.findOneAndUpdate(
      { _id: pollId },
      { $addToSet: { followers: user._id } },
      { new: true }
    )
      .populate("followers", "name avatar")
      .exec();

    await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { followPolls: pollId } },
      { new: true }
    ).exec();
    return result;
  }

  static unFollowPoll = async (
    pollId: string,
    userId: string,
  ) =>
  {
    await modelFindByID("Poll", pollId);
    const poll = await Poll
      .findById(pollId)
      .exec() as IPoll;
    const user
      = await User.findById(userId).exec() as IUser;
    await modelExists("Poll", pollId, userId, "followers", '尚未追蹤', true);
    const result = await Poll.findOneAndUpdate(
      { id: pollId },
      { $pull: { followers: user._id } },
      { new: true }
    )
      .populate("followers", "name avatar")
      .exec();
    await User.findOneAndUpdate(
      { id: userId },
      { $pull: { followedPolls: { poll } } },
      { new: true }
    ).exec();
    return result;
  }

  static startPollCheckService = async () => {
    Logger.log("Checking polls...", "INFO");
    const now = new Date();

    // 啟動待開始的投票
    await Poll.updateMany(
        { startDate: { $lte: now }, status: "pending" },
        { status: "active" }
    );

    const totalPollsActivated = await Poll.countDocuments({ status: "active" });
    Logger.log(`目前有 ${totalPollsActivated} 筆投票正在進行中`, "INFO");

    // 更新待結束的投票的狀態
    await Poll.updateMany(
        { endDate: { $lte: now }, status: "active" },
        { status: "ended" }
    );

    // 重新查找剛更新為 ended 的投票來進行後續處理
    const pollsToEnd = await Poll.find({ status: "ended" });

    for (let poll of pollsToEnd) {
        await this.calculateResultsForPoll(poll._id.toString());
    }

    const totalPollsToEnd = await Poll.countDocuments({ status: "closed" });
    Logger.log(`目前有 ${totalPollsToEnd} 筆投票已經結束`, "INFO");
};


  static startPoll = async (id: string, req, next: NextFunction) => {
    const poll = await Poll.findById(id).exec() as IPoll;
    await modelFindByID("Poll", id);
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
    await modelFindByID("Poll", id);
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
    poll.status = "ended";
    await poll.save();
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
