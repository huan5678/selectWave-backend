import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LineStrategy } from 'passport-line-auth';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as GitHubStrategy } from 'passport-github2';

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
const discordState = 'mongodb-express-discord';
const discordRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/discord/callback`;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/github/callback`;

const useGoogleStrategy = new
  GoogleStrategy({
    clientID: googleClientId as string,
    clientSecret: googleClientSecret as string,
    callbackURL: googleRedirectUrl,
  },
    async (accessToken, refreshToken, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

const useFacebookStrategy = new
  FacebookStrategy({
    clientID: facebookClientId as string,
    clientSecret: facebookClientSecret as string,
    callbackURL: facebookRedirectUrl,
  },
    async (accessToken, refreshToken, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

const useLineStrategy = new
  LineStrategy({
    channelID: lineChannelId as string,
    channelSecret: lineChannelSecret as string,
    callbackURL: lineRedirectUrl,
    scope: ['profile', 'openid', 'email'],
    botPrompt: 'normal',
  },
    async (accessToken, refreshToken, params, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

const useDiscordStrategy = new
  DiscordStrategy({
    clientID: discordClientId as string,
    clientSecret: discordClientSecret as string,
    callbackURL: discordRedirectUrl,
    scope: ['identify', 'email'],
  },
    async (accessToken, refreshToken, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);

const useGitHubStrategy = new
  GitHubStrategy({
    clientID: githubClientId as string,
    clientSecret: githubClientSecret as string,
    callbackURL: githubRedirectUrl,
  },
    async (accessToken, refreshToken, profile, done) =>
    {
      console.log('profile', profile);
      if (profile) {
          return done(null, profile);
        }
    }
);


export const usePassport = () =>
{
  passport.use(useGoogleStrategy);
  passport.use(useFacebookStrategy);
  passport.use(useLineStrategy);
  passport.use(useDiscordStrategy);
  passport.use(useGitHubStrategy);
};

export default passport;