const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ message: 'Admin access only' });
  }

  // If token lacks role (legacy tokens), look it up in DB
  if (!req.user.role) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true }
      });
      if (dbUser) {
        req.user.role = dbUser.role;
      }
    } catch (err) {
      console.error('Error fetching user role in adminOnly:', err);
    }
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};
