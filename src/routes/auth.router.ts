import { Router } from 'express';
import { AuthController, MailServiceController, ThirdPartyAuthController } from '@/controllers';
import { handleErrorAsync } from '@/utils';

const authRouter = Router();

authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '註冊'
   * #swagger.path = '/api/auth/register'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '註冊',
      schema: {
          email: 'example@example.com',
          password: 'Abc@12345',
          confirmPassword: 'Abc@12345',
      },
    }
    * #swagger.responses[200] = {
        schema: {
          status: true,
          message: '註冊成功',
          result: {
            token: 'eyJhbGciOi.....',
          },
        },
        description: "註冊成功",
      }
    * #swagger.responses[400] = {
        schema: {
            $ref: "#/definitions/ErrorEmailExist",
          },
        },
        description: "註冊失敗"
      }
    * #swagger.responses[400] = {
        schema: {
            $ref: "#/definitions/ErrorPasswordNotMatch",
          },
        },
        description: "註冊失敗"
      }
    * #swagger.responses[400] = {
        schema: {
            $ref: "#/definitions/ErrorInputFormat",
          },
        },
        description: "註冊失敗"
      }
    * #swagger.responses[400] = {
        schema: {
            $ref: "#/definitions/ErrorPasswordFormat",
          },
        },
        description: "註冊失敗"
      }
  */
  '/register', handleErrorAsync(AuthController.registerHandler));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '登入'
   * #swagger.path = '/api/auth/login'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '登入',
      schema: {
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    }
    * #swagger.responses[200] = {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            result: {
              authToken: { type: 'string' },
              member: { $ref: "#/definitions/User" },
            },
          },
        },
        description: "登入成功"
      }
    * #swagger.responses[400] = {
        schema: {
          $ref: "#/definitions/ErrorInputFormat"
        },
        description: "登入失敗"
      }
      * #swagger.responses[403] = {
          schema: {
            $ref: "#/definitions/ErrorPasswordNotMatch"
          },
          description: "登入失敗"
        }
    * #swagger.responses[404] = {
        schema: {
          $ref: "#/definitions/ErrorEmailNotFound"
        },
        description: "帳號或密碼錯誤"
      }
   */
  '/login', handleErrorAsync(AuthController.loginHandler));
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '登出'
   * #swagger.path = '/api/auth/logout'
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '登出成功',
      result: true,
    },
    description: "登出成功"
  }
  * #swagger.responses[400] = {
    schema: {
      $ref: "#/definitions/ErrorTokenNotFound"
    },
    description: "登出失敗"
  }
  * #swagger.responses[403] = {
    schema: {
    $ref: "#/definitions/ErrorJsonWebToken"
    },
    description: "登出失敗"
  }
  * #swagger.security = [{ "Bearer": [] }]
   */
  '/logout', handleErrorAsync(AuthController.logoutHandler));
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '由 Token 取得使用者資訊'
   * #swagger.path = '/api/auth/check'
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '驗證成功取得使用者資訊',
      result: { $ref: "#/definitions/User" },
    },
    description: "取得使用者資訊"
    }
  * #swagger.responses[401] = {
    schema: {
        $ref: "#/definitions/ErrorTokenExpired"
    },
    description: "Token 已經過期或無效"
  }
  * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorEmailNotFound"
    },
    description: "取得使用者資訊失敗"
  }
  * #swagger.security = [{ "Bearer": [] }]
   */
  '/check', handleErrorAsync(AuthController.decodeTokenHandler));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '重設密碼'
   * #swagger.path = '/api/auth/reset-password'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '重設密碼',
    schema: {
      email: 'example@example.com',
    },
  }
  * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '成功送出重設密碼信件，請收信並進行重設步驟',
    },
    description: "成功送出重設密碼信件"
  }
  * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorEmailNotFound"
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[400] = {
    schema: {
      $ref: "#/definitions/ErrorEmailFormat"
    },
    description: "重設密碼失敗"
  }
   */
  '/reset-password', handleErrorAsync(AuthController.resetPasswordHandler));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '更新帳號密碼'
   * #swagger.path = '/api/auth/change-password'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '更新帳號密碼',
    schema: {
        email: 'example@example.com',
        password: 'Abc@12345',
        confirmPassword: 'Abc@12345',
      },
    },
   * #swagger.responses[200] = {
      schema: {
        status: true,
        message: '成功更新密碼',
      },
      description: "成功更新密碼"
    }
    * #swagger.responses[400] = {
      schema: {
        $ref: "#/definitions/ErrorPasswordNotMatch"
      },
      description: "更新密碼失敗"
    }
    * #swagger.responses[401] = {
    schema: {
        $ref: "#/definitions/ErrorTokenExpired"
    },
    description: "Token 已經過期或無效"
  }
  * #swagger.responses[403] = {
    schema: {
      $ref: "#/definitions/ErrorJsonWebToken"
    },
    description: "驗證失敗"
  }
  * #swagger.responses[404] = {
    schema: {
    $ref: "#/definitions/ErrorEmailNotFound"
    },
    description: "更新密碼失敗"
  }
  * #swagger.security = [{ "Bearer": [] }]
   */
  '/change-password', handleErrorAsync(AuthController.changePasswordHandler));
authRouter.put(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '重設密碼'
   * #swagger.path = '/api/auth/reset-password'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '重設密碼',
    schema: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjY',
      password: 'Abc@12345',
      confirmPassword: 'Abc@12345',
    },
  }
  * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '成功重設密碼',
    },
    description: "成功重設密碼"
  }
  * #swagger.responses[400] = {
    schema: {
    $ref: "#/definitions/ErrorPasswordNotMatch"
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[400] = {
    schema: {
    $ref: "#/definitions/ErrorTokenNotFound"
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[400] = {
    schema: {
    $ref: "#/definitions/ErrorJsonWebToken"
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[404] = {
    schema: {
    $ref: "#/definitions/ErrorVerificationUrlExpired"
    },
    description: "重設密碼失敗"
  }
   */
  '/reset-password', handleErrorAsync(AuthController.verifyResetPasswordHandler));
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '驗證帳號'
   * #swagger.path = '/api/auth/verify'
   * #swagger.parameters['parameterName'] = {
    in: 'query',
    type: 'string',
    required: true,
    description: '驗證碼',
    schema: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjY'
  }
  * #swagger.responses[200] = {
    schema: {
    status: true,
      message: '驗證成功',
      result: {
        $ref: "#/definitions/User"
      }
    },
    description: "使用者成功驗證"
  }
  * #swagger.responses[400] = {
    schema: {
      $ref: "#/definitions/ErrorTokenNotFound"
    },
    description: "驗證帳號失敗"
  }
  * #swagger.responses[400] = {
    schema: {
    $ref: "#/definitions/ErrorJsonWebToken"
    },
    description: "驗證帳號失敗"
  }
  * #swagger.responses[404] = {
    schema: {
    $ref: "#/definitions/ErrorVerificationUrlExpired"
    },
    description: "驗證帳號失敗"
  }
  }
   */
  '/verify', handleErrorAsync(AuthController.verifyAccount));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '重新發送驗證 Email'
   * #swagger.path = '/api/auth/verify'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '重新發送驗證 Email',
    schema: {
      email: 'example@example.com',
    }
  }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '驗證信已寄出',
      result: '以成功寄送重新驗證信件至 Email: example@example.com',
    },
    description: '重新發送驗證 Email 成功',
  }
  * #swagger.responses[400] = {
    schema: {
    $ref: "#/definitions/ErrorEmailNotFound"
    },
    description: "重新發送驗證 Email 失敗"
  }
  * #swagger.responses[400] = {
    schema: {
    $ref: "#/definitions/ErrorEmailFormat"
    },
    description: "重新發送驗證 Email 失敗"
  }
   */
  '/verify', handleErrorAsync(MailServiceController.resendVerificationEmail));

authRouter.get(
  /**
   * #swagger.ignore = true
   */
  '/google', handleErrorAsync(ThirdPartyAuthController.loginWithGoogle));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/google/callback', handleErrorAsync(ThirdPartyAuthController.googleCallback));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/facebook', handleErrorAsync(ThirdPartyAuthController.loginWithFacebook));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/facebook/callback', handleErrorAsync(ThirdPartyAuthController.facebookCallback));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/line', handleErrorAsync(ThirdPartyAuthController.loginWithLine));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/line/callback', handleErrorAsync(ThirdPartyAuthController.lineCallback));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/discord', handleErrorAsync(ThirdPartyAuthController.loginWithDiscord));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/discord/callback', handleErrorAsync(ThirdPartyAuthController.discordCallback));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/github', handleErrorAsync(ThirdPartyAuthController.loginWithGithub));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/github/callback', handleErrorAsync(ThirdPartyAuthController.githubCallback));

export default authRouter;
