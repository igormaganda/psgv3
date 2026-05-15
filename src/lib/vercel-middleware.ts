import { verifyToken } from './auth';
import { prisma } from './prisma';
import { VercelRequest } from '@vercel/node';

// Vercel-compatible user type
export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

// Vercel-compatible authentication - verifies JWT token and returns user
export async function authenticateToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, active: true }
    });

    if (!user || !user.active) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Admin check helper
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

// Audit logging (same as original)
export async function auditLog(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: string,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress
      }
    });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging shouldn't break the main flow
  }
}

// Extract IP address from Vercel request
export function getIpAddress(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIp = req.headers['x-real-ip'] as string;

  return forwarded?.split(',')[0]?.trim() ||
         realIp ||
         req.socket?.remoteAddress ||
         'unknown';
}