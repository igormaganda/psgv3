import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function authenticateToken(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, active: true }
    });
    return user && user.active ? user : null;
  } catch {
    return null;
  }
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

    if (req.method === 'POST') {
      const { field, oldValue, newValue, reason } = req.body;

      const changeRequest = await prisma.profileChangeRequest.create({
        data: {
          userId: user.id,
          field,
          oldValue: JSON.stringify(oldValue),
          newValue: JSON.stringify(newValue),
          reason
        }
      });

      return res.json({ changeRequest });
    }

    if (req.method === 'GET') {
      const isAdmin = user.role === 'admin';

      if (isAdmin) {
        // Admin can see all pending requests
        const requests = await prisma.profileChangeRequest.findMany({
          where: { status: 'pending' },
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    employeeId: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        return res.json({ requests });
      } else {
        // Employees see only their own requests
        const requests = await prisma.profileChangeRequest.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        });

        return res.json({ requests });
      }
    }

    if (req.method === 'PUT' && user.role === 'admin') {
      const { requestId, status, reviewComment } = req.body;

      const request = await prisma.profileChangeRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        return res.status(404).json({ error: 'Change request not found' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Request already reviewed' });
      }

      // Update request status
      const updatedRequest = await prisma.profileChangeRequest.update({
        where: { id: requestId },
        data: {
          status,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewComment
        }
      });

      // If approved, update the profile
      if (status === 'approved') {
        const profile = await prisma.employeeProfile.findUnique({
          where: { userId: request.userId }
        });

        if (profile) {
          await prisma.employeeProfile.update({
            where: { userId: request.userId },
            data: {
              [request.field]: JSON.parse(request.newValue)
            }
          });
        }
      }

      return res.json({ request: updatedRequest });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Change request API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
