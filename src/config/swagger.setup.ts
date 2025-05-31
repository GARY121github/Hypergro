import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './swagger';

export const setupSwagger = (app: Application): void => {
  // Serve Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));
  
  // Redirect root to API documentation
  app.get('/', (_req, res) => {
    res.redirect('/api-docs');
  });
}; 