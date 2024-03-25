import { User } from "@/models";
import { IUser } from "@/types";
import { appError } from "@/utils";
import { modelFindByID } from "@/utils/modelCheck";
import { NextFunction } from "express";

class MemberService
{
  static countMembers = async () =>
  {
    return await User.countDocuments().exec();
  }

  static getAllMembers = async (skip: number, limit: number) =>
  {
    const users = await User.find()
      .select(
        "-gender -birthday -coin -followers -following -socialMedia -updatedAt -isValidator -isSubscribed -likedPolls"
      )
      .skip(skip)
      .limit(limit);
    return users;
  }

  static getMemberById = async (id: string) =>
  {
    await modelFindByID("User", id);
    const user = await User.findById(id)
      .select("-coin -updatedAt -isValidator")
      .populate({
        path: 'likedPolls.poll',
        select: { createdBy: 0, like: 0, comments: 0, options: 0, isPrivate: 0, createdTime: 0, createdAt: 0, updatedAt: 0 }
      })
      .populate({
        path: 'comments',
        select: { createdBy: 0, like: 0, comments: 0, options: 0, isPrivate: 0, createdTime: 0, createdAt: 0, updatedAt: 0 }
      })
      .exec();
    return user;
  }

  static updateMemberData = async (id: string, updateData: any) =>
  {
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-coin -updatedAt -isValidator -isSubscribed");
    return user;
  }

  static addMemberFollower = async (id: string, targetID: string, next: NextFunction) =>
  {
    await modelFindByID("User", id);
    const user = await User.findById(id) as IUser;
    const isAlreadyFollowing =
      user.followingUsers &&
      user.followingUsers.some(
        (following) => following.user.id.toString() === targetID
      );
    if (isAlreadyFollowing)
      throw appError({ code: 400, message: "您已經追蹤了該使用者", next });

    const resultUserData = await User.findOneAndUpdate(
      { id, "followingUsers.user": { $ne: targetID } },
      { $addToSet: { followingUsers: { user: targetID } } },
      { new: true }
    ).select("-coin -updatedAt -isValidator -isSubscribed");

    await User.findOneAndUpdate(
      { id: targetID },
      { $addToSet: { followedUsers: { user: id } } }
    );
    return resultUserData;
  }

  static deleteMemberFollower = async (id: string, targetID: string, next: NextFunction) =>
  {
    await modelFindByID("User", id);
    const user = await User.findById(id) as IUser;

    const isFollowing =
      user.followingUsers &&
      user.followingUsers.some(
        (following) => following.user.id.toString() === targetID
      );
    if (!isFollowing)
      throw appError({
        code: 400,
        message: "您尚未追蹤該使用者，無法取消追蹤",
        next,
      });

    await User.findOneAndUpdate(
      { id: id },
      { $pull: { followingUsers: { user: targetID } } }
    );

    await User.findOneAndUpdate(
      { id: targetID },
      { $pull: { followedUsers: { user: id } } }
    );

    return true;
  }
}

export default MemberService;
