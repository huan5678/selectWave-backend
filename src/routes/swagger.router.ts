import { Router, type NextFunction, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
const swaggerRouter = Router();

import swaggerSpec from '@develop/swagger_output.json';

swaggerRouter.get('/', (req, res) => {
    const healthCheck = {
        status: true,
        message: 'OK',
        uptime: process.uptime(),
        timestamp: Date.now(),
        host: req.headers.host
    };
    res.send(healthCheck);
})

swaggerRouter.use(
  /**
   * #swagger.ignore = true
   */
  '/swagger',
  swaggerUi.serve,
  (req: Request, res: Response, next: NextFunction) => {
    swaggerSpec.host = `${req.headers.host}`;

    if (process.env.NODE_ENV === 'production') {
      swaggerSpec.schemes = ['https'];
    }

    const opts = {
      // customfavIcon: '/public/favicon.ico',
      customSiteTitle: swaggerSpec.info.title,
    };

    const requestHandler = swaggerUi.setup(swaggerSpec, opts);

    requestHandler(req, res, next);
  },
);

export default swaggerRouter;
