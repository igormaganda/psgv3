import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs/promises';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
void __filename;

type Role = 'employee' | 'admin';
interface UserRecord { id: string; email: string; role: Role; passwordHash: string; profile: Record<string, string>; active: boolean; }
interface Session { userId: string; expiresAt: number; }
interface ResetTokenRecord { tokenHash: string; userId: string; expiresAt: number; used: boolean; }
interface DocumentRecord { id: string; title: string; category: string; description: string; updatedAt: string; url: string; }
interface DataStore { users: UserRecord[]; documents: DocumentRecord[]; }

const PORT = Number(process.env.PORT || 3012);
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const DATA_PATH = path.join(process.cwd(), 'data', 'employee-portal.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const RESET_TTL_MS = 1000 * 60 * 30;

const sessions = new Map<string, Session>();
const resetTokens = new Map<string, ResetTokenRecord>();
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

const isoToday = () => new Date().toISOString().slice(0, 10);
const generateId = () => crypto.randomUUID();
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
const parseCookies = (cookie = '') => Object.fromEntries(cookie.split(';').map(v => v.trim()).filter(Boolean).map(p => p.split('=')));
const setSidCookie = (sid: string, secure: boolean) => `sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure ? '; Secure' : ''}`;
const clearSidCookie = (secure: boolean) => `sid=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashed = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hashed}`;
};
const verifyPassword = (password: string, stored: string): boolean => {
  const [algo, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const hashedBuffer = crypto.scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, 'hex');
  return storedBuffer.length === hashedBuffer.length && crypto.timingSafeEqual(storedBuffer, hashedBuffer);
};

const seedData = (): DataStore => ({
  users: [
    { id: 'u-admin', email: process.env.ADMIN_EMAIL || 'admin@psg.local', role: 'admin', passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'Admin#2026!'), active: true, profile: { firstName: 'Admin', lastName: 'PSG' } },
  ],
  documents: [
    { id: 'd1', title: 'Company Handbook', category: 'HR', description: 'Guide employé PSG', updatedAt: isoToday(), url: '/docs/handbook' },
    { id: 'd2', title: 'Vacation Request Form', category: 'Forms', description: 'Formulaire de congés', updatedAt: isoToday(), url: '/docs/vacation-request' },
  ],
});

const ensureDataFile = async () => {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  try { await fs.access(DATA_PATH); } catch { await fs.writeFile(DATA_PATH, JSON.stringify(seedData(), null, 2)); }
};
const loadData = async (): Promise<DataStore> => JSON.parse(await fs.readFile(DATA_PATH, 'utf-8')) as DataStore;
const saveData = async (data: DataStore) => fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
const publicUser = (u: UserRecord) => ({ id: u.id, email: u.email, role: u.role, active: u.active, profile: u.profile });

async function startServer() {
  await ensureDataFile();
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors({ origin: isProd ? APP_URL : true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  const auth = async (req: any, res: any, next: any) => {
    const sid = parseCookies(req.headers.cookie || '').sid;
    if (!sid) return res.status(401).json({ error: 'Unauthorized' });
    const s = sessions.get(sid);
    if (!s || s.expiresAt < Date.now()) return res.status(401).json({ error: 'Unauthorized' });
    const data = await loadData();
    const user = data.users.find((u) => u.id === s.userId && u.active);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    req.sid = sid;
    next();
  };
  const adminOnly = (req: any, res: any, next: any) => req.user.role !== 'admin' ? res.status(403).json({ error: 'Forbidden' }) : next();

  app.get('/api/me', auth, (req: any, res) => res.json({ user: publicUser(req.user) }));

  app.post('/api/auth/login', async (req, res) => {
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');
    const state = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
    if (state.blockedUntil > Date.now()) return res.status(429).json({ error: 'Too many attempts, try later' });

    const { email, password } = req.body || {};
    const data = await loadData();
    const user = data.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase() && u.active);
    if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
      const count = state.count + 1;
      loginAttempts.set(ip, { count: count >= 5 ? 0 : count, blockedUntil: count >= 5 ? Date.now() + 1000 * 60 * 15 : 0 });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    loginAttempts.delete(ip);
    const sid = crypto.randomBytes(24).toString('hex');
    sessions.set(sid, { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
    res.setHeader('Set-Cookie', setSidCookie(sid, isProd));
    return res.json({ user: publicUser(user) });
  });

  app.post('/api/auth/logout', auth, (req: any, res) => {
    sessions.delete(req.sid);
    res.setHeader('Set-Cookie', clearSidCookie(isProd));
    res.json({ ok: true });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const email = String(req.body?.email || '').toLowerCase();
    const data = await loadData();
    const user = data.users.find((u) => u.email.toLowerCase() === email && u.active);
    if (!user) return res.json({ message: 'If the account exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = hashToken(rawToken);
    resetTokens.set(tokenHash, { tokenHash, userId: user.id, expiresAt: Date.now() + RESET_TTL_MS, used: false });
    const resetLink = `${APP_URL}/employee/reset-password?token=${rawToken}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '465'), secure: true, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transporter.sendMail({ from: `"PSG Employee Portal" <${process.env.SMTP_USER}>`, to: user.email, subject: 'Password reset', text: `Reset your password: ${resetLink}` });
    }

    return res.json({ message: 'If the account exists, a reset link has been sent.', ...(isProd ? {} : { resetLink }) });
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    if (!token || password.length < 10) return res.status(400).json({ error: 'Invalid request' });
    const tokenHash = hashToken(token);
    const reset = resetTokens.get(tokenHash);
    if (!reset || reset.used || reset.expiresAt < Date.now()) return res.status(400).json({ error: 'Invalid or expired token' });

    const data = await loadData();
    const user = data.users.find((u) => u.id === reset.userId);
    if (!user) return res.status(400).json({ error: 'Invalid token' });
    user.passwordHash = hashPassword(password);
    await saveData(data);
    reset.used = true;
    resetTokens.set(tokenHash, reset);
    res.json({ ok: true });
  });

  app.get('/api/documents', auth, async (_req: any, res) => {
    const data = await loadData();
    res.json({ documents: data.documents });
  });
  app.get('/docs/:slug', auth, async (req: any, res) => res.type('text/plain').send(`Secure document preview: ${req.params.slug}`));

  app.get('/api/admin/users', auth, adminOnly, async (_req: any, res) => {
    const data = await loadData();
    res.json({ users: data.users.map(publicUser) });
  });
  app.post('/api/admin/users', auth, adminOnly, async (req: any, res) => {
    const { email, password, role, profile } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const data = await loadData();
    if (data.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) return res.status(409).json({ error: 'Email already exists' });
    data.users.push({ id: generateId(), email, role: role === 'admin' ? 'admin' : 'employee', passwordHash: hashPassword(password), active: true, profile: profile || {} });
    await saveData(data);
    res.status(201).json({ ok: true });
  });

  app.patch('/api/admin/users/:id', auth, adminOnly, async (req: any, res) => {
    const data = await loadData();
    const user = data.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    user.profile = { ...user.profile, ...(req.body.profile || {}) };
    if (typeof req.body.active === 'boolean') user.active = req.body.active;
    await saveData(data);
    res.json({ ok: true });
  });

  app.get('/api/admin/documents', auth, adminOnly, async (_req: any, res) => {
    const data = await loadData();
    res.json({ documents: data.documents });
  });
  app.post('/api/admin/documents', auth, adminOnly, async (req: any, res) => {
    const { title, category, description, url } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Missing fields' });
    const data = await loadData();
    data.documents.unshift({ id: generateId(), title, category: category || 'General', description: description || '', url, updatedAt: isoToday() });
    await saveData(data);
    res.status(201).json({ ok: true });
  });

  app.delete('/api/admin/documents/:id', auth, adminOnly, async (req: any, res) => {
    const data = await loadData();
    data.documents = data.documents.filter((d) => d.id !== req.params.id);
    await saveData(data);
    res.json({ ok: true });
  });

  app.post('/api/contact', async (req, res) => {
    const { name, title, company, email, phone, location, services, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
    try {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'martinet.o2switch.net', port: parseInt(process.env.SMTP_PORT || '465'), secure: true, auth: { user: process.env.SMTP_USER || 'info@protectionsecuritygroup.com', pass: process.env.SMTP_PASS || '' } });
      await transporter.sendMail({ from: `"Protection Security Group Contact" <${process.env.SMTP_USER || 'info@protectionsecuritygroup.com'}>`, to: process.env.CONTACT_RECIPIENTS || 'info@protectionsecuritygroup.com', replyTo: email, subject: `New Contact Form Submission from ${name}`, text: `${name} ${title} ${company} ${phone} ${location} ${(services || []).join(', ')} ${message}` });
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${APP_URL}`));
}

startServer();
