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
      // Get employee profile
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          lastPasswordChange: true,
          passwordExpiresAt: true,
          mustChangePassword: true,
          createdAt: true,
          profile: true
        }
      });

      if (!fullUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user: fullUser });
    }

    if (req.method === 'PUT') {
      // Update employee profile
      const profileData = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          profile: {
            update: profileData
          }
        },
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          profile: true
        }
      });

      await auditLog(
        user.id,
        'profile.update',
        'user',
        user.id,
        'Employee updated their profile',
        getIpAddress(req)
      );

      return res.json({ user: updatedUser });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}