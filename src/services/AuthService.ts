import { v4 as uuidv4 } from 'uuid';
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
};

export class AuthService {
  static BCRYPT_SALT = process.env.BCRYPT_SALT || 8;
  static FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN || 'http://localhost:3000';

  static login = async (options: {
    email: string;
    password: string;
  }, next: NextFunction): Promise<{ authToken: string; member: Omit<Member, 'passhash'> }> => {
    // get possible members
    const { email, password } = options;
    const member = await AuthService.getMemberByAccountOrEmail(email);
    if (!member) {
      throw appError({ code: 401, message: 'no such member', next });
    }

    // check password
    if (member.password && !bcrypt.compareSync(password, member.password)) {
      throw appError({ code: 403, message: 'password does not match', next });
    }

    const publicMember: Omit<Member, 'passhash'> = {
      id: member.id,
      email: member.email,
      name: member.name,
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
    console.log('profile', profile);
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

  static getMemberByAccountOrEmail = async (query: string): Promise<Member | null> =>
  {
    const userDocument = await User.findOne({
      where: {
        OR: [
          {
            email: query,
          },
        ],
      },
    });
    if (!userDocument) return null;

    const member: Member = {
      id: userDocument.id,
      name: userDocument.name,
      email: userDocument.email,
      password: userDocument.password,
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
      const user = await User.findById(email);
      if (!user) {
        throw new Error('User not found');
      }
      user.password = password;
      await user.save();
      return user;
    } catch (error) {
      throw appError({ message: (error as Error).message, next });
    }
  };
}
