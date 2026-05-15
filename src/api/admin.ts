import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, isPasswordStrong } from '../lib/auth';
import { authenticateToken, requireAdmin, auditLog, getIpAddress } from '../lib/middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'admin');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// ============ USER MANAGEMENT ============

// GET /api/admin/users - Get all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            { email: { contains: search as string, mode: 'insensitive' as const } },
            { profile: { firstName: { contains: search as string, mode: 'insensitive' as const } } },
            { profile: { lastName: { contains: search as string, mode: 'insensitive' as const } } },
            { profile: { employeeId: { contains: search as string, mode: 'insensitive' as const } } }
          ]
        }
      : {};

    const users = await prisma.user.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// POST /api/admin/users - Create new user
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, password, role, active, profile } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check password strength
    const passwordCheck = isPasswordStrong(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const passwordExpiresAt = new Date();
    passwordExpiresAt.setMonth(passwordExpiresAt.getMonth() + 6);

    // Create user with profile
    const user = await prisma.user.create({
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
      include: { profile: true }
    });

    // Audit log
    await auditLog(
      req.user!.id,
      'user.create',
      'user',
      user.id,
      `Created user: ${email}`,
      getIpAddress(req)
    );

    res.status(201).json({ user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role, active, profile } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email }
      });

      if (emailTaken) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        email: email || undefined,
        role: role || undefined,
        active: active !== undefined ? active : undefined,
        profile: profile ? {
          update: {
            ...profile
          }
        } : undefined
      },
      include: { profile: true }
    });

    // Audit log
    await auditLog(
      req.user!.id,
      'user.update',
      'user',
      user.id,
      `Updated user: ${user.email}`,
      getIpAddress(req)
    );

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id - Deactivate user (soft delete)
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Deactivate user (soft delete)
    await prisma.user.update({
      where: { id },
      data: { active: false }
    });

    // Audit log
    await auditLog(
      req.user!.id,
      'user.delete',
      'user',
      user.id,
      `Deactivated user: ${user.email}`,
      getIpAddress(req)
    );

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// ============ DOCUMENT MANAGEMENT ============

// GET /api/admin/documents - Get all documents
router.get('/documents', async (req: Request, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { visibility: 'admin' },
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

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// POST /api/admin/documents - Upload document
router.post('/documents', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, category, description } = req.body;
    const file = req.file;

    if (!title || !category || !file) {
      return res.status(400).json({ error: 'Title, category, and file are required' });
    }

    // Get file stats
    const fileStats = await fs.stat(file.path);

    // Create document record
    const document = await prisma.document.create({
      data: {
        title,
        category,
        description: description || null,
        filePath: file.path,
        fileName: file.originalname,
        fileSize: fileStats.size,
        mimeType: file.mimetype,
        visibility: 'admin',
        uploaderId: req.user!.id
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
      req.user!.id,
      'document.upload',
      'document',
      document.id,
      `Uploaded document: ${title}`,
      getIpAddress(req)
    );

    res.status(201).json({ document });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// DELETE /api/admin/documents/:id - Delete document
router.delete('/documents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get document
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    // Delete document record
    await prisma.document.delete({
      where: { id }
    });

    // Audit log
    await auditLog(
      req.user!.id,
      'document.delete',
      'document',
      document.id,
      `Deleted document: ${document.title}`,
      getIpAddress(req)
    );

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ============ AUDIT LOG ============

// GET /api/admin/audit-log - Get audit log
router.get('/audit-log', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      action,
      from,
      to
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from as string);
      }
      if (to) {
        where.createdAt.lte = new Date(to as string);
      }
    }

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.auditLog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      entries,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to get audit log' });
  }
});

export default router;