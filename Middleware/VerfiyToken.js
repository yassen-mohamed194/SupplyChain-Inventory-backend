const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization || '';

    const [scheme, token] = String(authHeader).split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: missing token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Misconfiguration: do not crash server, but refuse auth
      console.error('[AUTH] JWT_SECRET is not set');
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, secret);

    // Convention: attach decoded claims to req.user
    req.user = decoded;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized: invalid token' });
  }
}

module.exports = verifyToken;
