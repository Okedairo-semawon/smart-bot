import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { parseChatBody } from '../middleware/validateChat.js';

const opts = { maxMessageLength: 256 };

test('accepts a normal message and trims it', () => {
  const { value, error } = parseChatBody({ message: '  hello  ' }, opts);
  assert.equal(error, undefined);
  assert.deepEqual(value, { message: 'hello', sessionId: undefined });
});

test('accepts a server-style UUID v4 session id', () => {
  const sessionId = randomUUID();
  const { value, error } = parseChatBody({ message: 'hi', sessionId }, opts);
  assert.equal(error, undefined);
  assert.equal(value.sessionId, sessionId);
});

test('rejects NoSQL injection payloads in sessionId', () => {
  for (const sessionId of [{ $ne: null }, { $gt: '' }, ['a'], 123, true, null]) {
    const { error } = parseChatBody({ message: 'hi', sessionId }, opts);
    assert.equal(error, 'sessionId is invalid', JSON.stringify(sessionId));
  }
});

test('rejects a valid UUID wrapped in an array or object (regex would coerce it to a string)', () => {
  const id = randomUUID();
  for (const sessionId of [[id], { toString: () => id }, { $in: [id] }]) {
    assert.equal(parseChatBody({ message: 'hi', sessionId }, opts).error, 'sessionId is invalid');
  }
});

test('rejects malformed session id strings', () => {
  for (const sessionId of ['', 'abc', '../../etc/passwd', "' || '1'=='1", randomUUID() + 'x']) {
    assert.equal(parseChatBody({ message: 'hi', sessionId }, opts).error, 'sessionId is invalid');
  }
});

test('rejects non-string and empty messages', () => {
  for (const message of [undefined, null, 42, { text: 'x' }, ['x'], '', '   ']) {
    assert.ok(parseChatBody({ message }, opts).error, JSON.stringify(message));
  }
});

test('enforces the message length limit', () => {
  assert.equal(parseChatBody({ message: 'a'.repeat(256) }, opts).error, undefined);
  assert.match(parseChatBody({ message: 'a'.repeat(257) }, opts).error, /at most 256/);
});

test('rejects control characters but allows newlines and tabs', () => {
  assert.ok(parseChatBody({ message: 'hi\u0000there' }, opts).error);
  assert.equal(parseChatBody({ message: 'line one\nline two\tok' }, opts).error, undefined);
});

test('rejects bodies that are not JSON objects', () => {
  for (const body of [undefined, null, 'text', 5, [], [{ message: 'x' }]]) {
    assert.equal(parseChatBody(body, opts).error, 'Request body must be a JSON object');
  }
});
