import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApiKeyAuth } from '../middleware/auth.js';

const KEY_A = 'a'.repeat(40);
const KEY_B = 'b'.repeat(40);

function run(auth, headerValue) {
  const req = { get: (name) => (name.toLowerCase() === 'x-api-key' ? headerValue : undefined) };
  const out = { nextCalled: false, status: undefined, body: undefined };
  const res = {
    status(code) { out.status = code; return this; },
    json(body) { out.body = body; return this; },
  };
  auth(req, res, () => { out.nextCalled = true; });
  return out;
}

test('allows a request with a valid key', () => {
  const auth = createApiKeyAuth([KEY_A]);
  assert.equal(run(auth, KEY_A).nextCalled, true);
});

test('supports key rotation: any configured key works', () => {
  const auth = createApiKeyAuth([KEY_A, KEY_B]);
  assert.equal(run(auth, KEY_A).nextCalled, true);
  assert.equal(run(auth, KEY_B).nextCalled, true);
});

test('rejects missing, wrong, empty, non-string and oversized keys with 401', () => {
  const auth = createApiKeyAuth([KEY_A]);
  for (const value of [undefined, '', 'wrong', KEY_A + 'x', KEY_A.slice(1), 'a'.repeat(300)]) {
    const out = run(auth, value);
    assert.equal(out.nextCalled, false);
    assert.equal(out.status, 401);
    assert.deepEqual(out.body, { error: 'Unauthorized' });
  }
});