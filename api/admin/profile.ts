import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function authenticateToken(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, active: true }
    });
    return user && user.active ? user : null;
  } catch {
    return null;
  }
}

function isAdmin(user: any): boolean {
  return user?.role === 'admin';
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

    if (!isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.query;

    if (req.method === 'GET') {
      const profile = await prisma.employeeProfile.findUnique({
        where: { userId: userId as string }
      });

      return res.json({ profile });
    }

    if (req.method === 'PUT') {
      const data = req.body;

      const profile = await prisma.employeeProfile.upsert({
        where: { userId: userId as string },
        update: data,
        create: {
          userId: userId as string,
          ...data
        }
      });

      return res.json({ profile });
    }

    if (req.method === 'POST' && req.url.includes('/photo')) {
      // Photo upload would be handled separately with multipart form data
      return res.status(501).json({ error: 'Photo upload not implemented yet' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
