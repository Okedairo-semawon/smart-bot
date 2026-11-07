import {createHash, timingSafeEqual} from 'node:crypto';

const sha256 = (value) => createHash('sha256').update(value).digest();

export const inValidApiKeys = (candidate, hashedKeys) => {
    if (typeof candidate !== 'string' || candidate.length === 0 || candidate.length > 256) {
        return false;
    }
    const candidateHash = sha256(candidate);
    let matched = false;
    for (const keyHash of hashedKeys) {
        if (timingSafeEqual(candidateHash, keyHash)) matched = true;
            
    }
    return matched;
}

export const createApiKeyAuth = (keys) => {
    const hashedKeys = keys.map(sha256);
  return function requireApiKey(req, res, next) {
    if (isValidApiKey(req.get('x-api-key'), hashedKeys)) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  };
}