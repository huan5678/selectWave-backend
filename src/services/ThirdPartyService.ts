import axios from 'axios';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LineStrategy } from 'passport-line-auth';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '@/models';
import { IUser } from '@/types';
import { generateToken, randomPassword } from '@/utils';

const googleRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/google/callback`;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const lineRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/line/callback`;
const lineChannelId = process.env.LINE_CHANNEL_ID;
const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;
const lineState = 'mongodb-express-line-login';
const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
const facebookRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/facebook/callback`;
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;

const discordRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/discord/callback`;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/github/callback`;

const tokenHeader = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

function createOAuthTokenExchangeOptions(
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

const useGoogleStrategy = new
  GoogleStrategy({
    clientID: googleClientId as string,
    clientSecret: googleClientSecret as string,
    callbackURL: googleRedirectUrl,
  },
    function (_accessToken, _refreshToken, profile, done)
    {
      console.log('profile', profile);
      return done(null, profile);
    }
);

export const useGoogleCallback = async (req, res, _next) =>
{
    const code = req.query.code as string;
    const queryString = createOAuthTokenExchangeOptions(
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
  const { id, email, name, picture } = data;

  const user = await User.findOne({ email }) as unknown as IUser;

  if (!user) {
    const userData = await User.create({
      name,
      email,
      avatar: picture,
      password: randomPassword(),
      googleId: id,
      isValidator: true,
    });
    const authToken = generateToken({ userId: userData._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
  if (user) {
    const authToken = generateToken({ userId: user._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
}

const useFacebookStrategy = new
  FacebookStrategy({
    clientID: facebookClientId as string,
    clientSecret: facebookClientSecret as string,
    callbackURL: facebookRedirectUrl,
  },
    async (_accessToken, _refreshToken, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

export const useFacebookCallback = async (req, res, _next) =>
{
  const code = req.query.code as string;
  const queryString = createOAuthTokenExchangeOptions(
    code,
    facebookClientId as string,
    facebookClientSecret as string,
    facebookRedirectUrl,
  );
  const url = 'https://graph.facebook.com/v19.0/oauth/access_token';
  const response = await axios.get(`${url}?${queryString}`);
  const { access_token } = response.data;

  const { data } = await axios.get(
    `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${access_token}`,
  );
  const { id, email, name, picture } = data;

  const user = await User.findOne({ email }) as unknown as IUser;

  if (!user) {
    const userData = await User.create({
      name,
      email,
      avatar: picture.data.url,
      password: randomPassword(),
      facebookId: id,
      isValidator: true,
    });
    const authToken = generateToken({ userId: userData._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
  if (user) {
    const authToken = generateToken({ userId: user._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }

}

const useLineStrategy = new
  LineStrategy({
    channelID: lineChannelId as string,
    channelSecret: lineChannelSecret as string,
    callbackURL: lineRedirectUrl,
    scope: ['profile', 'openid', 'email'],
    botPrompt: 'normal',
  },
    async (_accessToken, _refreshToken, _params, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

export const useLineCallback = async (req, res, _next) =>
{
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
    const { data } = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

  const { userId, displayName, pictureUrl } = data;
  const email = getVerifyData.email;

  const user = await User.findOne({ email }) as unknown as IUser || await User.findOne({ lineId: userId }) as unknown as IUser;

  if (!user) {
    const userData = await User.create({
      name: displayName,
      email,
      avatar: pictureUrl,
      password: randomPassword(),
      lineId: userId,
      isValidator: true,
    });
    const authToken = generateToken({ userId: userData._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
  if (user) {
    const authToken = generateToken({ userId: user._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
}

const useDiscordStrategy = new
  DiscordStrategy({
    clientID: discordClientId as string,
    clientSecret: discordClientSecret as string,
    callbackURL: discordRedirectUrl,
    scope: ['identify', 'email'],
  },
    async (_accessToken, _refreshToken, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

export const useDiscordCallback = async (req, res, _next) =>
{
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

    const { data } = await axios.get('https://discord.com/api/oauth2/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  
  const { id, email } = data.user;
  const avatar = `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.png`;
  const name = data.username;

  const user = await User.findOne({ email }) as unknown as IUser || await User.findOne({ discordId: id }) as unknown as IUser;

  if (!user) {
    const userData = await User.create({
      name,
      email,
      avatar,
      password: randomPassword(),
      discordId: id,
      isValidator: true,
    });
    const authToken = generateToken({ userId: userData._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
  if (user) {
    const authToken = generateToken({ userId: user._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
}

const useGitHubStrategy = new
  GitHubStrategy({
    clientID: githubClientId as string,
    clientSecret: githubClientSecret as string,
    callbackURL: githubRedirectUrl,
  },
    async (_accessToken, _refreshToken, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

export const useGithubCallback = async (req, res, _next) =>
{
  const code = req.query.code as string;
  const options = {
    code,
    client_id: githubClientId as string,
    client_secret: githubClientSecret as string,
    redirect_uri: githubRedirectUrl as string,
  };
  const url = 'https://github.com/login/oauth/access_token';
  const queryString = new URLSearchParams(options).toString();
  const response = await axios.post(url, queryString, {
    headers: tokenHeader,
  });

  const { access_token } = response.data;

  const { data } = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { id, email, name, avatar_url } = data;

  const user = await User.findOne({ email }) as unknown as IUser || await User.findOne({ githubId: id }) as unknown as IUser;

  if (!user) {
    const userData = await User.create({
      name,
      email,
      avatar: avatar_url,
      password: randomPassword(),
      githubId: id,
      isValidator: true,
    });
    const authToken = generateToken({ userId: userData._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
  if (user) {
    const authToken = generateToken({ userId: user._id });

    res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
  }
}

export const usePassport = () =>
{
  passport.use(useGoogleStrategy);
  passport.use(useFacebookStrategy);
  passport.use(useLineStrategy);
  passport.use(useDiscordStrategy);
  passport.use(useGitHubStrategy);
};

export default passport;