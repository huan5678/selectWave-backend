import User from '@/models/user';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { NextFunction } from 'express';

import {
  googleClientId,
  googleClientSecret,
  googleRedirectUrl,
  facebookClientId,
  facebookClientSecret,
  facebookRedirectUrl,
  lineChannelId,
  lineChannelSecret,
  lineRedirectUrl,
  lineState,
  discordClientId,
  discordClientSecret,
  discordRedirectUrl,
  discordState,
} from '@/app/config';
import { IUser } from '@/types';
import { AuthService } from '@/services';

const tokenHeader = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

class ThirdPartyAuthController {
  private static userFieldMap: { [key: string]: string } = {
    google: 'googleId',
    facebook: 'facebookId',
    line: 'lineId',
    discord: 'discordId',
  };

  private static async findUser(
    type: keyof typeof this.userFieldMap,
    id: string,
    email: string,
  ): Promise<IUser | null> {
    const field = this.userFieldMap[type];
    return field
      ? User.findOne({
          $or: [{ [field]: id }, { email }],
        })
      : null;
  }

  private static createOAuthQueryParams(
    clientId: string,
    redirectUri: string,
    scope: string[],
    state?: string,
    responseType: string = 'code',
    accessType: string = 'offline',
  ): string {
    const query = {
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope.join(' '),
      access_type: accessType,
      ...(state && { state }), // 只有當 state 存在時才添加
    };

    return new URLSearchParams(query).toString();
  }

  private static createOAuthTokenExchangeOptions(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    grantType: string = 'authorization_code',
  ): string {
    const options = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: grantType,
    };

    return new URLSearchParams(options).toString();
  }

  public static async loginWithGoogle(_req, res, _next: NextFunction) {
    const queryString = this.createOAuthQueryParams(googleClientId as string, googleRedirectUrl, [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ]);

    const authUrl = 'https://accounts.google.com/o/oauth2/auth';
    res.redirect(`${authUrl}?${queryString}`);
  }
  public static async googleCallback(req, res, _next: NextFunction) {
    const code = req.query.code as string;
    const queryString = this.createOAuthTokenExchangeOptions(
      code,
      googleClientId as string,
      googleClientSecret as string,
      googleRedirectUrl,
    );
    const url = 'https://oauth2.googleapis.com/token';
    const response = await axios.post(url, queryString);

    const { id_token, access_token } = response.data;

    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      },
    );
    const { id, email } = data;
    const user = (await this.findUser('google', id, email)) as IUser;
    AuthService.thirdPartyAuthCreateMember(res, user, data, 'googleId');
  }
  public static async loginWithFacebook(_req, res, _next: NextFunction) {
    const queryString = ThirdPartyAuthController.createOAuthQueryParams(
      facebookClientId as string,
      facebookRedirectUrl,
      ['public_profile', 'email'],
    );
    const auth_url = 'https://www.facebook.com/v2.10/dialog/oauth';
    res.redirect(`${auth_url}?${queryString}`);
  }
  public static async facebookCallback(req, res, _next: NextFunction) {
    const code = req.query.code as string;
    const queryString = ThirdPartyAuthController.createOAuthTokenExchangeOptions(
      code,
      facebookClientId as string,
      facebookClientSecret as string,
      facebookRedirectUrl,
    );
    const url = 'https://graph.facebook.com/v2.10/oauth/access_token';
    const response = await axios.post(url, queryString);

    const { access_token } = response.data;

    const query = {
      fields: ['id', 'email', 'name', 'picture'].join(','),
      access_token,
    };
    const params = new URLSearchParams(query).toString();
    const { data } = await axios.get(`https://graph.facebook.com/me?${params}`);
    const { id, email } = data;
    const user = (await ThirdPartyAuthController.findUser('facebook', id, email)) as IUser;
    AuthService.thirdPartyAuthCreateMember(res, user, data, 'facebookId');
  }
  public static async loginWithLine(_req, res, _next: NextFunction) {
    const query = {
      response_type: 'code',
      client_id: lineChannelId as string,
      redirect_uri: lineRedirectUrl as string,
      state: lineState as string,
      scope: 'profile openid email',
      nonce: uuidv4(),
    };
    const auth_url = 'https://access.line.me/oauth2/v2.1/authorize';
    const queryString = new URLSearchParams(query).toString();
    res.redirect(`${auth_url}?${queryString}`);
  }
  public static async lineCallback(req, res, _next: NextFunction) {
    const code = req.query.code as string;
    const options = {
      code,
      client_id: lineChannelId as string,
      client_secret: lineChannelSecret as string,
      redirect_uri: lineRedirectUrl as string,
      state: lineState as string,
      grant_type: 'authorization_code',
    };
    const url = 'https://api.line.me/oauth2/v2.1/token';
    const queryString = new URLSearchParams(options).toString();
    const response = await axios.post(url, queryString, {
      headers: tokenHeader,
    });

    const { access_token, id_token } = response.data;

    const { data } = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const verifyBody = {
      id_token,
      client_id: lineChannelId as string,
    };

    const verifyBodyString = new URLSearchParams(verifyBody).toString();

    const { data: getVerifyData } = await axios.post(
      'https://api.line.me/oauth2/v2.1/verify',
      verifyBodyString,
      {
        headers: tokenHeader,
      },
    );
    const id = data.userId;
    const email = getVerifyData.email;
    data.id = id;
    data.email = email;
    const user = (await this.findUser('line', id, email)) as IUser;
    AuthService.thirdPartyAuthCreateMember(res, user, data, 'lineId');
  }
  public static async loginWithDiscord(_req, res, _next: NextFunction) {
    const query = {
      client_id: discordClientId as string,
      redirect_uri: discordRedirectUrl as string,
      response_type: 'code',
      state: discordState as string,
      scope: ['email', 'identify'].join(' '),
    };
    const auth_url = 'https://discord.com/api/oauth2/authorize';
    const queryString = new URLSearchParams(query).toString();
    res.redirect(`${auth_url}?${queryString}`);
  }
  public static async discordCallback(req, res, _next: NextFunction) {
    const code = req.query.code as string;
    const options = {
      code,
      client_id: discordClientId as string,
      client_secret: discordClientSecret as string,
      redirect_uri: discordRedirectUrl as string,
      grant_type: 'authorization_code',
      scope: 'email identify',
    };
    const url = 'https://discord.com/api/oauth2/token';

    const queryString = new URLSearchParams(options).toString();

    const response = await axios.post(url, queryString);

    const { access_token } = response.data;

    const { data } = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id, email } = data;
    data.photo = `https://cdn.discordapp.com/avatars/${id}/${data.avatar}`;
    data.name = data.username;

    const user = (await this.findUser('discord', id, email)) as IUser;
    AuthService.thirdPartyAuthCreateMember(res, user, data, 'discordId');
  }
}

export default ThirdPartyAuthController;
