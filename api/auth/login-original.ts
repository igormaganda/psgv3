import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/src/lib/prisma';
import { verifyPassword, generateToken, calculatePasswordExpiry, getPasswordDaysLeft } from '@/src/lib/auth';
import { auditLog, getIpAddress } from '@/src/lib/vercel-middleware';

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