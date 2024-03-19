import axios from "axios";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LineStrategy } from "passport-line-auth";
import { Strategy as DiscordStrategy, Scope } from "passport-discord-auth";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "@/models";
import { IUser } from "@/types";
import { generateToken, randomPassword } from "@/utils";
import config from "./config";

const tokenHeader = {
  "Content-Type": "application/x-www-form-urlencoded",
};

class thirdPartyAuthService {
  static initialize() {
    passport.use(this.googleStrategy());
    passport.use(this.facebookStrategy());
    passport.use(this.lineStrategy());
    passport.use(this.discordStrategy());
    passport.use(this.githubStrategy());
  }

  static createOAuthTokenExchangeOptions(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    grantType: string = "authorization_code"
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

  static googleStrategy() {
    return new GoogleStrategy(
      {
        clientID: config.googleClientId as string,
        clientSecret: config.googleClientSecret as string,
        callbackURL: config.googleRedirectUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        return done(null, profile);
      }
    );
  }

  static facebookStrategy() {
    return new FacebookStrategy(
      {
        clientID: config.facebookClientId as string,
        clientSecret: config.facebookClientSecret as string,
        callbackURL: config.facebookRedirectUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        return done(null, profile);
      }
    );
  }

  static lineStrategy() {
    return new LineStrategy(
      {
        channelID: config.lineChannelId as string,
        channelSecret: config.lineChannelSecret as string,
        callbackURL: config.lineRedirectUrl,
        scope: ["profile", "openid", "email"],
        botPrompt: "normal",
      },
      async (_accessToken, _refreshToken, _params, profile, done) => {
        return done(null, profile);
      }
    );
  }

  static discordStrategy() {
    return new DiscordStrategy(
      {
        clientId: config.discordClientId as string,
        clientSecret: config.discordClientSecret as string,
        callbackUrl: config.discordRedirectUrl,
        scope: [Scope.Identify, Scope.Email],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        return done(null, profile);
      }
    );
  }

  static githubStrategy() {
    return new GitHubStrategy(
      {
        clientID: config.githubClientId as string,
        clientSecret: config.githubClientSecret as string,
        callbackURL: config.githubRedirectUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        return done(null, profile);
      }
    );
  }

  static async googleCallback(req, res, _next) {
    const code = req.query.code as string;
    const queryString = this.createOAuthTokenExchangeOptions(
      code,
      config.googleClientId as string,
      config.googleClientSecret as string,
      config.googleRedirectUrl
    );
    const url = "https://oauth2.googleapis.com/token";
    const response = await axios.post(url, queryString);

    const { id_token, access_token } = response.data;

    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    const { id, email, name, picture } = data;

    const user = (await User.findOne({ email })) as unknown as IUser;

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

  static async facebookCallback(req, res, _next) {
    const code = req.query.code as string;
    const queryString = this.createOAuthTokenExchangeOptions(
      code,
      config.facebookClientId as string,
      config.facebookClientSecret as string,
      config.facebookRedirectUrl
    );
    const url = "https://graph.facebook.com/v19.0/oauth/access_token";
    const response = await axios.get(`${url}?${queryString}`);
    const { access_token } = response.data;

    const { data } = await axios.get(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${access_token}`
    );
    const { id, email, name, picture } = data;

    const user = (await User.findOne({ email })) as unknown as IUser;

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

  static async lineCallback(req, res, _next) {
    const code = req.query.code as string;
    const options = {
      code,
      client_id: config.lineChannelId as string,
      client_secret: config.lineChannelSecret as string,
      redirect_uri: config.lineRedirectUrl as string,
      state: config.lineState as string,
      grant_type: "authorization_code",
    };
    const url = "https://api.line.me/oauth2/v2.1/token";
    const queryString = new URLSearchParams(options).toString();
    const response = await axios.post(url, queryString, {
      headers: tokenHeader,
    });

    const { access_token, id_token } = response.data;

    const verifyBody = {
      id_token,
      client_id: config.lineChannelId as string,
    };

    const verifyBodyString = new URLSearchParams(verifyBody).toString();

    const { data: getVerifyData } = await axios.post(
      "https://api.line.me/oauth2/v2.1/verify",
      verifyBodyString,
      {
        headers: tokenHeader,
      }
    );
    const { data } = await axios.get("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { userId, displayName, pictureUrl } = data;
    const email = getVerifyData.email;

    const user =
      ((await User.findOne({ email })) as unknown as IUser) ||
      ((await User.findOne({ lineId: userId })) as unknown as IUser);

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

  static async discordCallback(req, _res, _next)
  {
    console.log(req.query);
    // const result = passport.authenticate('discord')(req, res);
    // console.log(result);
    // const { code } = req.query as { code: string };
    // const url = "https://discord.com/api/oauth2/token";
    // const body = new URLSearchParams({
    //   client_id: config.discordClientId as string,
    //   client_secret: config.discordClientSecret as string,
    //   code,
    //   redirect_uri: config.discordRedirectUrl,
    //   grant_type: "authorization_code",
    //   scope: "identify email",
    // });
    // try {
    //   const response = await axios.post(
    //     url,
    //     body,
    //     {
    //       headers: tokenHeader,
    //     }
    //   );

    //   const { access_token } = response.data;

    //   const { data } = await axios.get("https://discord.com/api/oauth2/@me", {
    //     headers: {
    //       Authorization: `Bearer ${access_token}`,
    //     },
    //   });

    //   const { id, email } = data.user;
    //   const avatar = `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.png`;
    //   const name = data.username;

    //   const user =
    //     ((await User.findOne({ email })) as unknown as IUser) ||
    //     ((await User.findOne({ discordId: id })) as unknown as IUser);

    //   if (!user) {
    //     const userData = await User.create({
    //       name,
    //       email,
    //       avatar,
    //       password: randomPassword(),
    //       discordId: id,
    //       isValidator: true,
    //     });
    //     const authToken = generateToken({ userId: userData._id });

    //     res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
    //   }
    //   if (user) {
    //     const authToken = generateToken({ userId: user._id });

    //     res.redirect(`${process.env.FRONTEND_DOMAIN}/#/?token=${authToken}`);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  }

  static async githubCallback(req, res, _next) {
    const code = req.query.code as string;
    const options = {
      code,
      client_id: config.githubClientId as string,
      client_secret: config.githubClientSecret as string,
      redirect_uri: config.githubRedirectUrl as string,
    };
    const url = "https://github.com/login/oauth/access_token";
    const queryString = new URLSearchParams(options).toString();
    const response = await axios.post(url, queryString, {
      headers: tokenHeader,
    });

    const { access_token } = response.data;

    const { data } = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id, email, name, avatar_url } = data;

    const user =
      ((await User.findOne({ email })) as unknown as IUser) ||
      ((await User.findOne({ githubId: id })) as unknown as IUser);

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
}

export default thirdPartyAuthService;
