import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import chatRoute from './Routes/chatRoute.js';
import { createApiKeyAuth } from './middleware/auth.js';
import { env } from './configuration/env.js';
import 'dotenv/config';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.trustProxy !== false) app.set('trust proxy', env.trustProxy);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins, // [] means no cross-origin browser access
      methods: ['POST'],
      allowedHeaders: ['Content-Type', 'X-API-Key'],
      maxAge: 600,
    })
  );

  // General per-IP limit. Protects the Dialogflow quota and bill.
  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: env.rateLimitPerMinute,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down' },
  });

  // Stricter limit that only counts failed requests (bad key, bad input),
  // so key guessing gets slowed down without penalising normal users.
  const failureLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many failed requests, try again later' },
  });

  app.use(
    '/chat',
    generalLimiter,
    failureLimiter,
    createApiKeyAuth(env.apiKeys), 
    express.json({ limit: '10kb' }),
    chatRoute
  );

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // Central error handler: 
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Payload too large' });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    console.error('Unhandled error:', err.name, err.message);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}