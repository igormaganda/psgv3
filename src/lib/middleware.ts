import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth';
import { prisma } from './prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Authentication middleware - verifies JWT token
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, active: true }
    });

    if (!user || !user.active) {
      return res.status(403).json({ error: 'User account inactive or not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Admin role middleware - verifies user is an admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

// Audit logging middleware
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

// Extract IP address from request
export function getIpAddress(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] as string ||
         req.socket.remoteAddress ||
         'unknown';
}