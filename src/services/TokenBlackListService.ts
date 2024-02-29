import { TokenBlacklist } from "@/models";
import { TokenPayload } from "@/types";
import { appError, verifyToken } from '@/utils';

class TokenBlackListService {
  public static async isTokenBlacklisted(token: string): Promise<boolean> {
    const isBlacklisted = await TokenBlacklist.exists({ token });
    if (isBlacklisted) {
      throw appError({ code: 401, message: "Token 已經失效" });
    }
    return false;
  }
  public static async createTokenBlackList(
    token: string): Promise<void>
  {
    const decodedToken = verifyToken(token) as TokenPayload;
    const expiresAt = new Date(decodedToken.exp * 1000);
    if (await TokenBlacklist.exists({ token })) {
      throw appError({ code: 400, message: "Token 已經在黑名單中" });
    }
    await TokenBlacklist.create({ token, expiresAt });
  }
}

export default TokenBlackListService;
