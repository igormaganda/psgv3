import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/src/lib/prisma';
import { auditLog, getIpAddress, authenticateToken, isAdmin } from '@/src/lib/vercel-middleware';

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

    if (req.method === 'DELETE') {
      // DELETE /api/admin/documents/:id - Delete document
      const { id } = req.query;

      await prisma.document.delete({
        where: { id: id as string }
      });

      // Audit log
      await auditLog(
        user.id,
        'document.delete',
        'document',
        id as string,
        `Deleted document`,
        getIpAddress(req)
      );

      return res.json({ message: 'Document deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Document API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}