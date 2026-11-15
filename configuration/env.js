// Loads .env, then validates the environment once, at startup.

import 'dotenv/config';
import { loadEnv } from './loadEnv.js';

export const env = loadEnv(process.env);