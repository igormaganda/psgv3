import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Inline auth functions to avoid import issues
function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(payload: any): Promise<string> {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
}

function calculatePasswordExpiry(lastChange: Date): Date {
  const expiry = new Date(lastChange);
  expiry.setMonth(expiry.getMonth() + 6);
  return expiry;
}

function getPasswordDaysLeft(expiresAt: Date): number {
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Simple audit log (inline)
async function auditLog(userId: string, action: string, entityType: string | null, entityId: string | null, details: string | null, ipAddress: string) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entityType, entityId, details, ipAddress }
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Get IP address (inline)
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Calculate password expiry
    const passwordExpiresAt = user.passwordExpiresAt || calculatePasswordExpiry(user.lastPasswordChange);
    const passwordDaysLeft = getPasswordDaysLeft(passwordExpiresAt);
    const mustChangePassword = user.mustChangePassword || passwordDaysLeft <= 0;

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Audit log
    await auditLog(
      user.id,
      'login',
      null,
      null,
      'User logged in',
      getIpAddress(req)
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName
      },
      passwordDaysLeft,
      mustChangePassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}