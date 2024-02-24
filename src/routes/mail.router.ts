import MailServiceController from '@/controllers/mailer.controller';

import { handleErrorAsync } from '@/utils';

import { Router } from 'express';

const mailRouter = Router();

mailRouter.post(
  /**
   * #swagger.ignore = true
   */
  '/contact', handleErrorAsync(MailServiceController.sendMail));

export default mailRouter;