import { Router } from 'express';
import { db, clients, patients } from '@repo/db';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

// GET /api/clients
router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const tenantClients = await db.select().from(clients).where(eq(clients.tenantId, tenantId));
    
    // Adaptamos los clientes devueltos para que coincidan con la interfaz de la UI
    const formattedClients = tenantClients.map(c => ({
      ...c,
      pets: [], // Idealmente se haría un JOIN con patients, pero lo mantenemos ligero por ahora
      lastVisitDate: new Date().toISOString().split('T')[0],
      lastVisitReason: 'Consulta general'
    }));
    
    res.json({ success: true, data: formattedClients });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const data = req.body;

    const inserted = await db.insert(clients).values({
      tenantId,
      name: data.name,
      email: data.email || 'correo@ejemplo.com',
      phone: data.phone || '00000000',
      dni: data.dni,
      address: data.address,
      notes: data.notes
    }).returning();

    const clientId = inserted[0].id;

    // Si envían array de mascotas desde el formulario, las guardamos como Pacientes
    if (data.pets && Array.isArray(data.pets) && data.pets.length > 0) {
      const patientsToInsert = data.pets.map((pet: any) => ({
        tenantId,
        clientId,
        code: `#PT-${Math.floor(10000 + Math.random() * 90000)}`,
        name: pet.name,
        species: pet.species || 'No especificada',
        breed: pet.breed || 'Mestizo',
        gender: pet.gender || 'macho',
        age: pet.age || 'Desconocida',
        status: 'sano'
      }));
      
      await db.insert(patients).values(patientsToInsert);
    }

    res.json({ success: true, data: inserted[0] });
  } catch (err: any) {
    console.error('Error in clients POST:', err);
    res.status(500).json({ success: false, error: 'Error interno guardando cliente', details: err.message });
  }
});

export default router;
