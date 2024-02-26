import passport, { useGoogleCallback, useFacebookCallback, useLineCallback, useDiscordCallback, useGithubCallback } from '@/services/ThirdPartyService';

class ThirdPartyAuthController
{

  public static async loginWithGoogle(req, res, _next)
  {
    await passport.authenticate('google', { scope: [ 'profile', 'email' ] })(req, res);
  }

  public static async googleCallback(req, res, next)
  {
    await useGoogleCallback(req, res, next);
  }

  public static async loginWithFacebook(req, res, _next)
  {
    passport.authenticate('facebook', { scope: [ 'public_profile', 'email', 'user_gender', 'user_photos' ] })(req, res);

  }
  public static async facebookCallback(req, res, next) {
    await useFacebookCallback(req, res, next);
  }

  public static async loginWithLine(req, res, _next)
  {
    passport.authenticate('line')(req, res);
  }

  public static async lineCallback(req, res, next) {
    await useLineCallback(req, res, next);
  }
  public static async loginWithDiscord(req, res, _next) {
    passport.authenticate('discord')(req, res);
  }
  public static async discordCallback(req, res, next) {
    await useDiscordCallback(req, res, next);
  }
  public static async loginWithGithub(req, res, _next) {
    passport.authenticate('github')(req, res);
  }
  public static async githubCallback(req, res, next) {
    await useGithubCallback(req, res, next);
  }
}

export default ThirdPartyAuthController;
