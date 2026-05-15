import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/src/lib/prisma';
import { hashPassword, isPasswordStrong, calculatePasswordExpiry } from '@/src/lib/auth';
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

    const { id } = req.query;

    if (req.method === 'GET') {
      // GET /api/admin/users/:id - Get single user
      const targetUser = await prisma.user.findUnique({
        where: { id: id as string },
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

      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user: targetUser });
    }

    if (req.method === 'PUT') {
      // PUT /api/admin/users/:id - Update user
      const { email, role, active, profile, password } = req.body;

      const updateData: any = {};
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (active !== undefined) updateData.active = active;

      if (password) {
        const passwordCheck = isPasswordStrong(password);
        if (!passwordCheck.valid) {
          return res.status(400).json({ error: passwordCheck.message });
        }
        updateData.passwordHash = await hashPassword(password);
        updateData.lastPasswordChange = new Date();
        updateData.passwordExpiresAt = calculatePasswordExpiry(new Date());
        updateData.mustChangePassword = false;
      }

      if (profile) {
        updateData.profile = {
          update: profile
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id: id as string },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          profile: true
        }
      });

      // Audit log
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
      // DELETE /api/admin/users/:id - Soft delete user
      await prisma.user.update({
        where: { id: id as string },
        data: { active: false }
      });

      // Audit log
      await auditLog(
        user.id,
        'user.delete',
        'user',
        id as string,
        `Deactivated user account`,
        getIpAddress(req)
      );

      return res.json({ message: 'User deactivated successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}