export const googleRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/google/callback`;
export const googleClientId = process.env.GOOGLE_CLIENT_ID;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const lineRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/line/callback`;
export const lineChannelId = process.env.LINE_CHANNEL_ID;
export const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;
export const lineState = 'mongodb-express-line-login';

export const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
export const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
export const facebookRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/facebook/callback`;

export const discordClientId = process.env.DISCORD_CLIENT_ID;
export const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
export const discordState = 'mongodb-express-discord';
export const discordRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/discord/callback`;

export const githubClientId = process.env.GITHUB_CLIENT_ID;
export const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
export const githubRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/github/callback`;

export const twitterClientId = process.env.TWITTER_CLIENT_ID;
export const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
export const twitterRedirectUrl = `${process.env.BACKEND_DOMAIN}/api/auth/twitter/callback`;
