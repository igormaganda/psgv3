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

async function auditLog(userId: string, action: string, entityType: string | null, entityId: string | null, details: string | null, ipAddress: string) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entityType, entityId, details, ipAddress }
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

function getIpAddress(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIp = req.headers['x-real-ip'] as string;
  return forwarded?.split(',')[0]?.trim() || realIp || req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    await auditLog(
      user.id,
      'logout',
      null,
      null,
      'User logged out',
      getIpAddress(req)
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}