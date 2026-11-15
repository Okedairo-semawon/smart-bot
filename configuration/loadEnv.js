// Pure function: reads a plain object (normally process.env) and returns the
// validated, frozen config. Kept separate from env.js so it can be tested
// without touching the real environment or loading dotenv.
// If anything security-critical is missing, it throws (fail closed) instead of
// letting the server run with an open API.

export function loadEnv(source) {
    const required = (name) => {
      const value = source[name]?.trim();
      if (!value) throw new Error(`Missing required environment variable: ${name}`);
      return value;
    };
  
    const list = (name) =>
      (source[name] ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
  
    const positiveNumber = (name, fallback) => {
      const raw = source[name];
      if (raw === undefined || raw === '') return fallback;
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${name} must be a positive number`);
      }
      return value;
    };
  
    // API_KEYS is a comma-separated list so keys can be rotated without downtime:
    // add the new key, deploy clients, then remove the old one.
    const apiKeys = list('API_KEYS');
    if (apiKeys.length === 0) {
      throw new Error(
        'API_KEYS is required. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
    if (apiKeys.some((key) => key.length < 32)) {
      throw new Error('Every key in API_KEYS must be at least 32 characters long');
    }
  
    // Number of reverse proxies in front of the app (e.g. 1 on Render/Heroku/Nginx).
    // Leave unset when the app is reachable directly, otherwise client IPs
    // (and therefore rate limiting) will be wrong.
    const trustProxy = (() => {
      const raw = source.TRUST_PROXY;
      if (!raw) return false;
      const hops = Number(raw);
      if (!Number.isInteger(hops) || hops < 1) {
        throw new Error('TRUST_PROXY must be a whole number of proxy hops (1, 2, ...)');
      }
      return hops;
    })();
  
    return Object.freeze({
      port: positiveNumber('PORT', 8000),
      mongoUri: required('MONGODB_URI'),
      projectId: required('PROJECT_ID'),
      apiKeys,
      corsOrigins: list('CORS_ORIGINS'), // empty = browsers on other origins are blocked
      trustProxy,
      sessionTtlMs: positiveNumber('SESSION_TTL_HOURS', 24) * 60 * 60 * 1000,
      maxHistory: Math.floor(positiveNumber('MAX_HISTORY', 50)),
      maxMessageLength: 256, // Dialogflow ES text input limit
      rateLimitPerMinute: Math.floor(positiveNumber('RATE_LIMIT_PER_MINUTE', 30)),
    });
  }