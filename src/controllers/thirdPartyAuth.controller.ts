import User from '@/models/user';

import { NextFunction } from 'express';

import { generateToken, successHandle } from '@/utils';
import passport from '@/services/ThirdPartyService';


class ThirdPartyAuthController
{

  public static async loginWithGoogle(req, res, _next: NextFunction)
  {
    await passport.authenticate('google', { scope: [ 'profile', 'email' ] })(req, res);
  }

  public static async googleCallback(req, res, _next: NextFunction)
  {
    await passport.authenticate('google', { session: false }, (req, res) =>
    {
      console.log('req', req);
      if (req.user)
      {
        const token = generateToken({userId: req.user._id});
        return successHandle(res, '成功登入', { token });
      }
    })(req, res);
  }

  public static async loginWithFacebook(req, res, _next: NextFunction)
  {
    passport.authenticate('facebook', { scope: [ 'public_profile', 'email', 'user_gender', 'user_photos' ] })(req, res);

  }
  public static async facebookCallback(req, res, _next: NextFunction) {
    passport.authenticate('facebook', { session: false }, (req, res) => {
      console.log('req', req);
      if (req.user) {
        const token = generateToken({ userId: req.user._id });
        return successHandle(res, '成功登入', { token });
      }
    })(req, res);
  }

  public static async loginWithLine(req, res, _next: NextFunction)
  {
    passport.authenticate('line')(req, res);
  }

  public static async lineCallback(req, res, _next: NextFunction) {
    passport.authenticate('line', { session: false }, (req, res) => {
      console.log('req', req);
      if (req.user) {
        const token = generateToken({ userId: req.user._id });
        return successHandle(res, '成功登入', { token });
      }
    })(req, res);
  }
  public static async loginWithDiscord(req, res, _next: NextFunction) {
    passport.authenticate('discord')(req, res);
  }
  public static async discordCallback(req, res, _next: NextFunction) {
    passport.authenticate('discord', { session: false }, (req, res) => {
      console.log('req', req);
      if (req.user) {
        const token = generateToken({ userId: req.user._id });
        return successHandle(res, '成功登入', { token });
      }
    })(req, res);
  }
  public static async loginWithGithub(req, res, _next: NextFunction) {
    passport.authenticate('github')(req, res);
  }
  public static async githubCallback(req, res, _next: NextFunction) {
    passport.authenticate('github', { session: false }, (req, res) => {
      console.log('req', req);
      if (req.user) {
        const token = generateToken({ userId: req.user._id });
        return successHandle(res, '成功登入', { token });
      }
    })(req, res);
  }
}

export default ThirdPartyAuthController;
