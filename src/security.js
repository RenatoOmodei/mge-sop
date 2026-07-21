const crypto = require('crypto');

const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = 'sha512';

function randomToken(size = 32) {
  return crypto.randomBytes(size).toString('base64url');
}

function hashPassword(password, salt = randomToken(16), iterations = PASSWORD_ITERATIONS) {
  const hash = crypto
    .pbkdf2Sync(String(password), salt, iterations, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString('hex');

  return { salt, hash, iterations, digest: PASSWORD_DIGEST };
}

function timingSafeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left), 'utf8');
  const rightBuffer = Buffer.from(String(right), 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyPassword(password, stored) {
  if (!stored || !stored.salt || !stored.hash) {
    return false;
  }

  const next = hashPassword(password, stored.salt, stored.iterations);
  return timingSafeEqualText(next.hash, stored.hash);
}

function signValue(value, secret) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('base64url');
}

function createSignedCookieValue(value, secret) {
  return `${value}.${signValue(value, secret)}`;
}

function readSignedCookieValue(cookieValue, secret) {
  if (!cookieValue || !cookieValue.includes('.')) {
    return null;
  }

  const splitAt = cookieValue.lastIndexOf('.');
  const value = cookieValue.slice(0, splitAt);
  const signature = cookieValue.slice(splitAt + 1);
  const expected = signValue(value, secret);

  if (!timingSafeEqualText(signature, expected)) {
    return null;
  }

  return value;
}

module.exports = {
  createSignedCookieValue,
  hashPassword,
  randomToken,
  readSignedCookieValue,
  verifyPassword
};
