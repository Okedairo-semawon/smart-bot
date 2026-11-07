// UUID v4 only: these are the IDs the server itself generates.
export const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Control characters except tab and newline.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function parseChatBody(body, { maxMessageLength }) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const { message, sessionId } = body;

  if (typeof message !== 'string') {
    return { error: 'message must be a string' };
  }
  const text = message.trim();
  if (text.length === 0) {
    return { error: 'message is required' };
  }
  if (text.length > maxMessageLength) {
    return { error: `message must be at most ${maxMessageLength} characters` };
  }
  if (CONTROL_CHARS.test(text)) {
    return { error: 'message contains invalid characters' };
  }

  if (sessionId !== undefined) {
    if (typeof sessionId !== 'string' || !SESSION_ID_PATTERN.test(sessionId)) {
      return { error: 'sessionId is invalid' };
    }
  }

  return { value: { message: text, sessionId } };
}

export function createChatValidator(options) {
  return function validateChat(req, res, next) {
    const { value, error } = parseChatBody(req.body, options);
    if (error) return res.status(400).json({ error });
    req.chat = value;
    return next();
  };
}