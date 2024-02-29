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

export default {
  googleRedirectUrl,
  googleClientId,
  googleClientSecret,
  lineRedirectUrl,
  lineChannelId,
  lineChannelSecret,
  lineState,
  facebookClientId,
  facebookClientSecret,
  facebookRedirectUrl,
  discordClientId,
  discordClientSecret,
  discordRedirectUrl,
  githubClientId,
  githubClientSecret,
  githubRedirectUrl,
};