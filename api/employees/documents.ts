import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Inline functions
async function authenticateToken(token: string) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, active: true }
    });
    return user && user.active ? user : null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await authenticateToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'GET') {
      // Get all documents (both admin and employee documents)
      const documents = await prisma.document.findMany({
        where: {
          OR: [
            { visibility: 'admin' },
            { visibility: 'employee' },
            { uploaderId: user.id }
          ]
        },
        include: {
          uploader: {
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
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ documents });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Documents API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}