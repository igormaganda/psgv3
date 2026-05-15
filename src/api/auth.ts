import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateToken, isPasswordStrong, calculatePasswordExpiry, getPasswordDaysLeft } from '../lib/auth';
import { authenticateToken, auditLog, getIpAddress } from '../lib/middleware';

const router = Router();

// POST /api/auth/login - Login endpoint
router.post('/login', async (req: Request, res: Response) => {
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

    // Update last login (optional, you might want to add this field to User model)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { lastLogin: new Date() }
    // });

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
});

// POST /api/auth/logout - Logout endpoint
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Audit log
    await auditLog(
      req.user!.id,
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
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordDaysLeft = getPasswordDaysLeft(user.passwordExpiresAt);
    const mustChangePassword = user.mustChangePassword || passwordDaysLeft <= 0;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        active: user.active,
        profile: user.profile
      },
      passwordDaysLeft,
      mustChangePassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        active: true,
        lastPasswordChange: true,
        passwordExpiresAt: true,
        mustChangePassword: true,
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Check new password strength
    const passwordCheck = isPasswordStrong(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    const passwordExpiresAt = calculatePasswordExpiry(new Date());

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
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
      'Password changed',
      getIpAddress(req)
    );

    // Generate new token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Password updated successfully',
      token,
      passwordDaysLeft: getPasswordDaysLeft(passwordExpiresAt),
      mustChangePassword: false
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;