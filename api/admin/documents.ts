import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@/src/lib/prisma';
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

    if (req.method === 'GET') {
      // GET /api/admin/documents - List documents
      const { category, search } = req.query;

      const where: any = {};
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const documents = await prisma.document.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ documents });
    }

    if (req.method === 'POST') {
      // POST /api/admin/documents - Upload document (simplified version)
      const { title, category, description, fileName, fileSize, mimeType, visibility } = req.body;

      if (!title || !fileName) {
        return res.status(400).json({ error: 'Title and filename are required' });
      }

      const document = await prisma.document.create({
        data: {
          title,
          category: category || 'General',
          description,
          filePath: `/uploads/${fileName}`,
          fileName,
          fileSize: fileSize || 0,
          mimeType: mimeType || 'application/pdf',
          visibility: visibility || 'admin',
          uploaderId: user.id
        },
        include: {
          uploader: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      // Audit log
      await auditLog(
        user.id,
        'document.upload',
        'document',
        document.id,
        `Uploaded document: ${title}`,
        getIpAddress(req)
      );

      return res.json({ document });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Documents API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}