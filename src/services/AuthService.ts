import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { appError, generateToken, passwordCheck } from '@/utils';
import { User } from '@/models';
import { IUser, ThirdPartyProfile } from '@/types';
import { randomPassword } from '@/utils';
import { NextFunction } from 'express';

type Member = {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
};

export class AuthService {
  static BCRYPT_SALT = process.env.BCRYPT_SALT || 8;
  static FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || 'http://localhost:3000';

  static verifyPassword = (password: string, passhash: string): boolean => {
    return bcrypt.compareSync(password, passhash);
  }

  static login = async (options: {
    email: string;
    password: string;
  }, next: NextFunction): Promise<{ authToken: string; member: Omit<Member, 'passhash'> }> => {
    // get possible members
    const { email, password } = options;
    const member = await AuthService.getMemberByAccountOrEmail(email);
    if (!member) {
      throw appError({ code: 404, message: '請確認 Email 是否正確', next });
    }

    // check password
    if (member.password && !AuthService.verifyPassword(password, member.password)) {
      throw appError({ code: 403, message: '密碼錯誤', next });
    }

    const publicMember: Omit<Member, 'passhash'> = {
      id: member.id,
      email: member.email,
      name: member.name,
      avatar: member.avatar,
    };
    const authToken = generateToken({ userId: member.id });
    return { authToken, member: publicMember };
  };

  static registerMember = async (profile: {
    name?: string;
    email: string;
    password?: string | null;
  }, next: NextFunction): Promise<{ authToken: string; member: Omit<Member, 'passhash'> }> => {
    const memberId = uuidv4();
    const { email, password } = profile;
    if (!passwordCheck(password as string))
      throw appError({
        code: 400,
        message: '密碼強度不足，請確認是否具至少有 1 個數字， 1 個大寫英文， 1 個小寫英文， 1 個特殊符號，且長度至少為 8 個字元',
        next,
      });
    try {
      const memberData = await User.create({
          id: memberId,
          password,
          email,
      });

      const verificationToken = jwt.sign(
        { userId: memberData._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );
      memberData.verificationToken = verificationToken;
      await memberData.save();

      const publicMember: Omit<Member, 'passhash'> = {
        id: memberData._id,
        email: memberData.email,
        name: memberData.name,
      };
      const authToken = generateToken({ userId: memberData.id });
      return { authToken, member: publicMember };
    } catch (error) {
      throw appError({ message: (error as Error).message, next });
    }
  };

  static getMemberByAccountOrEmail = async (email: string): Promise<Member | null> =>
  {
    const userDocument = await User.findOne({ email }).exec();

    if (!userDocument) return null;

    const member: Member = {
      id: userDocument.id,
      name: userDocument.name,
      email: userDocument.email,
      password: userDocument.password,
      avatar: userDocument.avatar,
    };

    return member || null;
  };

  static thirdPartyAuthCreateMember = async (
    res,
    user: IUser,
    getData: ThirdPartyProfile,
    thirdParty: string,
  ) => {
    let token: string;
    let userData: IUser;

    if (!user) {
      userData = await User.create({
        name: getData.name,
        password: randomPassword(),
        [`${thirdParty}`]: getData.id,
        email: getData.email || `${getData.id}@${thirdParty}.com`,
        avatar: getData.picture,
      });
    } else {
      userData = user;
    }

    token = generateToken({ userId: userData._id });

    const authParams = new URLSearchParams([
      ['token', token],
      ['id', userData._id as string],
      ['avatar', userData.avatar || ''],
      ['name', userData.name],
    ]).toString();

    return res.redirect(`${this.FRONTEND_DOMAIN}?${authParams}`);
  };

  static updatePassword = async ({ email, password, next }: { email: string; password: string; next: NextFunction }) => {
    try {
      const user = await User.findOne({ email }).exec();
      if (!user) {
        throw appError({ code: 404, message: '此 Email 未註冊', next });
      }
      user.password = password;
      await user.save();
      return user;
    } catch (error) {
      throw appError({ message: (error as Error).message, next });
    }
  };

  static deleteMemberById = async (id: string, next: NextFunction) => {
    try {
      const user = await User.findByIdAndDelete(id).exec();
      if (!user) throw appError({ code: 404, message: '無此使用者請確認使用者 id 是否正確', next });
      return user;
    } catch (error) {
      throw appError({ message: (error as Error).message, next });
    }
  }

  static updateValidationToken = () =>
  {
    cron.schedule('0 1 * * *', async () =>
    {
      console.log('Running a job at 01:00 to update verification tokens');
      const users = await User.find({ isValidator: false, verificationToken: { $ne: '' } });

      users.forEach(async (user) =>
      {
        const newVerificationToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET as string,
          { expiresIn: '24h' } // 根據需要調整過期時間
        );
        user.verificationToken = newVerificationToken;
        await user.save();
      });
    }, {
      scheduled: true,
      timezone: "Asia/Taipei"
    });
  };
}

