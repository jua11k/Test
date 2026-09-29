import { Router } from 'express';
import { db, clients, patients, tenants } from '@repo/db';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

// Login del tutor en el portal público
router.post('/login', async (req, res) => {
  try {
    const { email, dni, slug } = req.body;
    
    // Primero, encontrar el tenantId
    const t = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    if (t.length === 0 && slug !== 'manila-clinic' && slug !== 'vet-principal') {
      return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    }
    
    const tenantId = t.length > 0 ? t[0].id : '00000000-0000-0000-0000-000000000001';

    // Buscar el cliente por email y DNI
    const c = await db.select().from(clients).where(
      and(
        eq(clients.tenantId, tenantId),
        eq(clients.email, email),
        eq(clients.dni, dni)
      )
    ).limit(1);

    if (c.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas o cliente no registrado' });
    }

    const client = c[0];

    // Buscar mascotas asociadas
    const pts = await db.select().from(patients).where(eq(patients.clientId, client.id));

    // Generar JWT
    const token = jwt.sign({
      userId: client.id,
      tenantId: tenantId,
      role: 'tutor_portal',
      email: client.email
    }, JWT_SECRET, { expiresIn: '12h' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000 // 12 horas
    });

    res.json({
      success: true,
      data: {
        ...client,
        pets: pts
      }
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

import { requireAuth } from '../middleware/requireAuth';

// (Arriba del archivo ya hay imports, pero insertaremos el de requireAuth si no existe)
// Pero wait, reemplazaré todo el bloque de register y añadiré el nuevo endpoint:

router.post('/register', async (req, res) => {
  try {
    const { name, email, dni, phone, petName, petSpecies, slug } = req.body;
    
    // Primero, encontrar el tenantId
    const t = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    const tenantId = t.length > 0 ? t[0].id : '00000000-0000-0000-0000-000000000001';

    // Verificar si existe el DNI o Email en la veterinaria
    const existing = await db.select().from(clients).where(
      and(
        eq(clients.tenantId, tenantId),
        eq(clients.email, email) // Por simplicidad, solo chequeamos email
      )
    ).limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'El correo electrónico ya está registrado. Inicia sesión.' });
    }

    // Insertar cliente
    const insertedClient = await db.insert(clients).values({
      tenantId,
      name,
      email,
      dni,
      phone,
      address: '',
      notes: 'Registrado desde portal público'
    }).returning();

    const client = insertedClient[0];
    const pts = [];

    // Si proporcionó mascota, insertarla
    if (petName && petName.trim() !== '') {
      const insertedPet = await db.insert(patients).values({
        tenantId,
        clientId: client.id,
        code: `#PT-${Math.floor(10000 + Math.random() * 90000)}`,
        name: petName,
        species: petSpecies || 'canino', // Ahora acepta la especie
        breed: 'Mestizo',
        gender: 'macho',
        age: 'Desconocida',
        status: 'sano'
      }).returning();
      
      pts.push(insertedPet[0]);
    }

    // Generar JWT
    const token = jwt.sign({
      userId: client.id,
      tenantId: tenantId,
      role: 'tutor_portal',
      email: client.email
    }, JWT_SECRET, { expiresIn: '12h' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        ...client,
        pets: pts
      }
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

// Endpoint protegido para que el tutor agregue nuevas mascotas
router.post('/pets', requireAuth, async (req, res) => {
  try {
    const { petName, petSpecies } = req.body;
    const user = (req as any).user;

    if (user.role !== 'tutor_portal') {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }

    if (!petName || petName.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }

    const insertedPet = await db.insert(patients).values({
      tenantId: user.tenantId,
      clientId: user.userId, // JWT guardó el ID del cliente en userId
      code: `#PT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: petName,
      species: petSpecies || 'canino',
      breed: 'Mestizo',
      gender: 'macho',
      age: 'Desconocida',
      status: 'sano'
    }).returning();

    res.json({ success: true, data: insertedPet[0] });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

export default router;
