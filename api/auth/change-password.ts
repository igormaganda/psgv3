import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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

function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function isPasswordStrong(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: '' };
}

function calculatePasswordExpiry(date: Date): Date {
  const expiry = new Date(date);
  expiry.setMonth(expiry.getMonth() + 6);
  return expiry;
}

function getPasswordDaysLeft(expiresAt: Date): number {
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    // Get user with password
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!fullUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, fullUser.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check new password strength
    const passwordCheck = isPasswordStrong(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(newPassword, fullUser.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    const passwordExpiresAt = calculatePasswordExpiry(new Date());

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        lastPasswordChange: new Date(),
        passwordExpiresAt,
        mustChangePassword: false
      }
    });

    // Audit log
    await auditLog(
      user.id,
      'password.change',
      null,
      null,
      'User changed password',
      getIpAddress(req)
    });

    res.json({
      message: 'Password updated successfully',
      passwordDaysLeft: getPasswordDaysLeft(passwordExpiresAt),
      mustChangePassword: false
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
}