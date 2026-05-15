import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/src/lib/prisma';
import { authenticateToken, isAdmin } from '@/src/lib/vercel-middleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify token and admin role
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await authenticateToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // GET /api/admin/audit-log - Get audit logs
      const { action, entityType, userId, limit = '50' } = req.query;

      const where: any = {};
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (userId) where.userId = userId;

      const logs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string)
      });

      return res.json({ logs });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Audit log API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}