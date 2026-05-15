import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Role = 'employee' | 'admin';
interface UserRecord { id: string; email: string; role: Role; passwordHash: string; profile: any; }
interface Session { userId: string; expiresAt: number; }

const sessions = new Map<string, Session>();
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();
const documents = [
  { id: 'd1', title: 'Company Handbook', category: 'HR', description: 'Guide employé PSG', updatedAt: '2026-05-01', url: '/docs/handbook' },
  { id: 'd2', title: 'Vacation Request Form', category: 'Forms', description: 'Formulaire de congés', updatedAt: '2026-05-10', url: '/docs/vacation-request' },
];

const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const users: UserRecord[] = [
  { id: 'u-admin', email: 'admin@psg.local', role: 'admin', passwordHash: hash('Admin#2026!'), profile: { firstName: 'Admin', lastName: 'PSG' } },
  { id: 'u-emp', email: 'employee@psg.local', role: 'employee', passwordHash: hash('Employee#2026!'), profile: { firstName: 'Team', lastName: 'Member' } },
];

const publicUser = (u: UserRecord) => ({ id: u.id, email: u.email, role: u.role, profile: u.profile });
const createSession = (userId: string) => {
  const sid = crypto.randomBytes(24).toString('hex');
  sessions.set(sid, { userId, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 });
  return sid;
};
const getSessionId = (cookie = '') => cookie.split(';').map((v) => v.trim()).find((v) => v.startsWith('sid='))?.split('=')[1];

async function startServer() {
  const app = express();
  const PORT = 3012;
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  const auth = (req: any, res: any, next: any) => {
    const sid = getSessionId(req.headers.cookie || '');
    if (!sid) return res.status(401).json({ error: 'Unauthorized' });
    const s = sessions.get(sid);
    if (!s || s.expiresAt < Date.now()) return res.status(401).json({ error: 'Unauthorized' });
    const user = users.find((u) => u.id === s.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    req.sid = sid;
    next();
  };

  app.get('/api/me', auth, (req: any, res) => res.json({ user: publicUser(req.user) }));
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user || user.passwordHash !== hash(password)) return res.status(401).json({ error: 'Invalid credentials' });
    const sid = createSession(user.id);
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    return res.json({ user: publicUser(user) });
  });
  app.post('/api/auth/logout', auth, (req: any, res) => { sessions.delete(req.sid); res.setHeader('Set-Cookie', 'sid=; Max-Age=0; Path=/'); res.json({ ok: true }); });
  app.post('/api/auth/forgot-password', (req, res) => {
    const user = users.find((u) => u.email === req.body.email);
    if (!user) return res.json({ message: 'If the account exists, a reset link has been sent.' });
    const token = crypto.randomBytes(18).toString('hex');
    resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 1000 * 60 * 30 });
    const resetLink = `http://localhost:${PORT}/employee/login?resetToken=${token}`;
    return res.json({ message: 'Reset link generated.', resetLink });
  });

  app.get('/api/documents', auth, (_req, res) => res.json({ documents }));
  app.get('/docs/:slug', auth, (req, res) => res.type('text/plain').send(`Secure document preview: ${req.params.slug}`));

  app.get('/api/admin/users', auth, (req: any, res) => req.user.role !== 'admin' ? res.status(403).json({ error: 'Forbidden' }) : res.json({ users: users.map(publicUser) }));
  app.post('/api/admin/users', auth, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { email, password, role, profile } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    users.push({ id: crypto.randomUUID(), email, role: role || 'employee', passwordHash: hash(password), profile });
    return res.status(201).json({ ok: true });
  });
  app.get('/api/admin/documents', auth, (req: any, res) => req.user.role !== 'admin' ? res.status(403).json({ error: 'Forbidden' }) : res.json({ documents }));

  // contact
  app.post('/api/contact', async (req, res) => {
    const { name, title, company, email, phone, location, services, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
    try {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'martinet.o2switch.net', port: parseInt(process.env.SMTP_PORT || '465'), secure: true, auth: { user: process.env.SMTP_USER || 'info@protectionsecuritygroup.com', pass: process.env.SMTP_PASS || 'Ko=i&223(P5+.7v6' } });
      await transporter.sendMail({ from: `"Protection Security Group Contact" <${process.env.SMTP_USER || 'info@protectionsecuritygroup.com'}>`, to: process.env.CONTACT_RECIPIENTS || 'info@protectionsecuritygroup.com', replyTo: email, subject: `New Contact Form Submission from ${name}`, text: `${name} ${title} ${company} ${phone} ${location} ${(services || []).join(', ')} ${message}` });
      res.status(200).json({ message: 'Email sent successfully' });
    } catch { res.status(500).json({ error: 'Failed to send email' }); }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}
startServer();
