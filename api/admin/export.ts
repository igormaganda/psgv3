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

function isAdmin(user: any): boolean {
  return user?.role === 'admin';
}

function arrayToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const escaped = ('' + (value ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
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

    const { type, search, role, status, department, action, dateFrom, dateTo } = req.query;

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let data: any[] = [];
    let filename = 'export.csv';
    let headers: string[] = [];

    if (type === 'users') {
      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { profile: { firstName: { contains: search as string, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search as string, mode: 'insensitive' } } },
          { profile: { employeeId: { contains: search as string, mode: 'insensitive' } } }
        ];
      }

      if (role) where.role = role;
      if (status !== '') where.active = status === 'true';
      if (department) where.profile = { ...where.profile, department };

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          profile: true
        }
      });

      data = users.map(u => ({
        'Employee ID': u.profile?.employeeId || '',
        'First Name': u.profile?.firstName || '',
        'Last Name': u.profile?.lastName || '',
        'Email': u.email,
        'Role': u.role,
        'Status': u.active ? 'Active' : 'Inactive',
        'Department': u.profile?.department || '',
        'Job Title': u.profile?.jobTitle || '',
        'Hire Date': u.profile?.hireDate ? new Date(u.profile.hireDate).toLocaleDateString() : ''
      }));

      filename = `users-${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Department', 'Job Title', 'Hire Date'];

    } else if (type === 'documents') {
      const documents = await prisma.document.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
          fileName: true,
          fileSize: true,
          createdAt: true,
          uploader: {
            select: {
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

      data = documents.map(d => ({
        'Title': d.title,
        'Category': d.category,
        'Description': d.description || '',
        'File Name': d.fileName,
        'Size': d.fileSize ? `${(d.fileSize / 1024).toFixed(1)} KB` : '',
        'Uploaded By': d.uploader?.profile?.firstName && d.uploader?.profile?.lastName
          ? `${d.uploader.profile.firstName} ${d.uploader.profile.lastName}`
          : d.uploader?.email || '',
        'Upload Date': new Date(d.createdAt).toLocaleDateString()
      }));

      filename = `documents-${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Title', 'Category', 'Description', 'File Name', 'Size', 'Uploaded By', 'Upload Date'];

    } else if (type === 'audit') {
      const where: any = {};

      if (action) where.action = action;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
        if (dateTo) where.createdAt.lte = new Date(dateTo as string);
      }

      const logs = await prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          details: true,
          ipAddress: true,
          createdAt: true,
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
        orderBy: { createdAt: 'desc' },
        take: 1000
      });

      data = logs.map(l => ({
        'Date': new Date(l.createdAt).toLocaleString(),
        'Employee ID': l.user.profile?.employeeId || '',
        'User': l.user.profile?.firstName && l.user.profile?.lastName
          ? `${l.user.profile.firstName} ${l.user.profile.lastName}`
          : l.user.email,
        'Action': l.action,
        'Details': l.details || '',
        'IP Address': l.ipAddress || ''
      }));

      filename = `audit-${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Date', 'Employee ID', 'User', 'Action', 'Details', 'IP Address'];

    } else {
      return res.status(400).json({ error: 'Invalid export type' });
    }

    const csv = arrayToCSV(data, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);

  } catch (error) {
    console.error('Export API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
