import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db, tenants, users } from '@repo/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Helper de contraseñas nativo
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, hash: string) {
  const [salt, key] = hash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return key === derivedKey;
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const tenantId = '00000000-0000-0000-0000-000000000001';
    
    // Asegurar que el tenant exista (seed MVP)
    try {
      await db.insert(tenants).values({
        id: tenantId,
        slug: 'manila-clinic',
        name: 'Manila Clinic',
        commercialName: 'Manila Clinic S.A.'
      }).onConflictDoNothing();
    } catch (e) {
      console.error('Seed error:', e);
    }

    const hashedPassword = hashPassword(password);

    const result = await db.insert(users).values({
      email,
      passwordHash: hashedPassword,
      tenantId,
      role: 'admin'
    }).returning();

    return res.json({ success: true, data: result[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }
    return res.status(400).json({ success: false, error: err.errors || 'Bad Request' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Fallback al mock login temporal para el super admin (ANTES de tocar la DB por si falla la conexión)
    if (email === 'admin@manila.com' && password === '123456') {
      const tenantId = '00000000-0000-0000-0000-000000000001';
      const payload = { userId: '00000000-0000-0000-0000-000000000002', tenantId, role: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
      res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 });
      return res.json({ success: true, data: { user: payload } });
    }

    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
    
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000
    });
    
    return res.json({ success: true, data: { user: payload } });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.errors || 'Bad Request' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ success: false, error: 'No autorizado' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, data: { user: decoded } });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
});

export default router;
