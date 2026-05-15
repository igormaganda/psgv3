import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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

function isAdmin(user: any): boolean {
  return user?.role === 'admin';
}

async function hashPassword(password: string): Promise<string> {
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
  return { valid: true, message: '' };
}

function calculatePasswordExpiry(date: Date): Date {
  const expiry = new Date(date);
  expiry.setMonth(expiry.getMonth() + 6);
  return expiry;
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

    if (!isAdmin(user)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      const {
        search = '',
        role = '',
        status = '',
        department = '',
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' as const } },
          { profile: { firstName: { contains: search as string, mode: 'insensitive' as const } } },
          { profile: { lastName: { contains: search as string, mode: 'insensitive' as const } } },
          { profile: { employeeId: { contains: search as string, mode: 'insensitive' as const } } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status !== '') {
        where.active = status === 'true';
      }

      if (department) {
        where.profile = { ...where.profile, department };
      }

      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder === 'asc' ? 'asc' : 'desc';

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            role: true,
            active: true,
            createdAt: true,
            profile: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                jobTitle: true,
                department: true,
                hireDate: true
              }
            }
          },
          orderBy,
          skip,
          take: limitNum
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return res.json({
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    }

    if (req.method === 'POST') {
      const { email, password, role, active, profile } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const passwordCheck = isPasswordStrong(password);
      if (!passwordCheck.valid) {
        return res.status(400).json({ error: passwordCheck.message });
      }

      const passwordHash = await hashPassword(password);
      const passwordExpiresAt = calculatePasswordExpiry(new Date());

      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: role || 'employee',
          active: active !== undefined ? active : true,
          lastPasswordChange: new Date(),
          passwordExpiresAt,
          profile: profile ? {
            create: {
              ...profile,
              employeeId: profile.employeeId || `EMP-${Date.now()}`
            }
          } : undefined
        },
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          profile: true
        }
      });

      await auditLog(
        user.id,
        'user.create',
        'user',
        newUser.id,
        `Created user account for ${email}`,
        getIpAddress(req)
      );

      return res.json({ user: newUser });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { email, role, active, profile } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: id as string }
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData: any = {};
      if (email && email !== existingUser.email) {
        const emailCheck = await prisma.user.findUnique({ where: { email } });
        if (emailCheck) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        updateData.email = email;
      }
      if (role !== undefined) updateData.role = role;
      if (active !== undefined) updateData.active = active;

      const updatedUser = await prisma.user.update({
        where: { id: id as string },
        data: {
          ...updateData,
          ...(profile ? {
            profile: {
              update: {
                ...profile,
                employeeId: profile.employeeId || existingUser.profile?.employeeId
              }
            }
          } : {})
        },
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          profile: true
        }
      });

      await auditLog(
        user.id,
        'user.update',
        'user',
        id as string,
        `Updated user account for ${updatedUser.email}`,
        getIpAddress(req)
      );

      return res.json({ user: updatedUser });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: id as string }
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      await prisma.user.update({
        where: { id: id as string },
        data: { active: false }
      });

      await auditLog(
        user.id,
        'user.delete',
        'user',
        id as string,
        `Deactivated user account for ${existingUser.email}`,
        getIpAddress(req)
      );

      return res.json({ message: 'User deactivated successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
