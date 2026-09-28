import { Router } from 'express';
import { db, patients, clients } from '@repo/db';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Protegemos todas las rutas con el middleware IAM
router.use(requireAuth);

// GET /api/patients - Obtiene los pacientes del Tenant (Regla 01)
router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    
    // JOIN con clientes para hidratar la propiedad 'tutor' requerida por la UI
    const dbResults = await db
      .select({
        patient: patients,
        client: clients
      })
      .from(patients)
      .innerJoin(clients, eq(patients.clientId, clients.id))
      .where(eq(patients.tenantId, tenantId));
      
    const tenantPatients = dbResults.map(row => ({
      ...row.patient,
      tutor: {
        name: row.client.name,
        phone: row.client.phone,
        email: row.client.email
      }
    }));
      
    res.json({ success: true, data: tenantPatients });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// POST /api/patients - Crea un nuevo tutor (si no existe) y luego registra al paciente
router.post('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const data = req.body;
    
    let clientId: string;
    
    if (data.clientId) {
      // Si el frontend envía el ID del cliente directamente
      clientId = data.clientId;
    } else if (data.tutor && data.tutor.email) {
      // Buscar si el cliente ya existe por email (fallback inteligente)
      const existingClients = await db.select().from(clients)
        .where(and(eq(clients.tenantId, tenantId), eq(clients.email, data.tutor.email)))
        .limit(1);
        
      if (existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        // Crear cliente nuevo
        const insertedClients = await db.insert(clients).values({
          tenantId,
          name: data.tutor.name,
          email: data.tutor.email,
          phone: data.tutor.phone || '0000000',
        }).returning({ id: clients.id });
        clientId = insertedClients[0].id;
      }
    } else {
      return res.status(400).json({ success: false, error: 'Se requiere información del tutor o un clientId válido' });
    }

    // Insertar el paciente vinculado al cliente recién obtenido
    const insertedPatients = await db.insert(patients).values({
      tenantId,
      clientId,
      code: data.code || `PAT-${Math.floor(Math.random() * 10000)}`,
      name: data.name,
      species: data.species,
      breed: data.breed,
      gender: data.gender,
      neutered: data.neutered || false,
      age: data.age,
      status: data.status || 'sano',
      weightKg: data.weightKg,
      bodyConditionScore: data.bodyConditionScore,
    }).returning();

    res.json({ success: true, data: insertedPatients[0] });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno guardando el paciente' });
  }
});

export default router;
