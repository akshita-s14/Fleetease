const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden - insufficient role' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

module.exports = authMiddleware;
