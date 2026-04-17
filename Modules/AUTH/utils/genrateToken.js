const jwt = require('jsonwebtoken');

function generateToken(userOrId) {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  if (!secret) {
    // Fail fast with a clear error instead of issuing insecure tokens
    throw new Error('JWT secret missing. Set JWT_SECRET in .env');
  }

  const isObject = userOrId && typeof userOrId === 'object';
  const id = isObject ? (userOrId.id || userOrId._id) : userOrId;

  const payload = {
    sub: String(id),
    ...(isObject && userOrId.role ? { role: userOrId.role } : {}),
    ...(isObject && userOrId.email ? { email: userOrId.email } : {}),
    ...(isObject && userOrId.name ? { name: userOrId.name } : {}),
  };

  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

module.exports = generateToken;
