import { Router } from 'express';
import { db, clinicalNotes, patients, veterinarians } from '@repo/db';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const patientId = req.query.patientId as string;

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patientId requerido' });
    }

    const dbResults = await db.select({
      note: clinicalNotes,
      veterinarianName: veterinarians.name,
      veterinarianRegistration: veterinarians.registrationNumber,
      veterinarianSpecialty: veterinarians.specialty,
    })
    .from(clinicalNotes)
    .innerJoin(veterinarians, eq(clinicalNotes.veterinarianId, veterinarians.id))
    .where(eq(clinicalNotes.patientId, patientId))
    .orderBy(desc(clinicalNotes.createdAt));
    
    const formattedNotes = dbResults.map(row => ({
      id: row.note.id,
      patientId: row.note.patientId,
      date: new Date(row.note.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: new Date(row.note.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      title: row.note.title,
      type: row.note.type,
      typeLabel:
        row.note.type === 'cirugia'
          ? 'Nota Quirúrgica'
          : row.note.type === 'urgencia'
          ? 'Urgencia Médica'
          : row.note.type === 'preventivo'
          ? 'Control Preventivo'
          : 'Consulta de Control',
      veterinarianName: row.veterinarianName,
      veterinarianRegistration: row.veterinarianRegistration,
      veterinarianSpecialty: row.veterinarianSpecialty,
      vitals: {
        temp: row.note.temp || '',
        fc: row.note.heartRate || '',
        fr: row.note.respRate || '',
        weight: row.note.weight || '',
      },
      narrative: row.note.narrative,
      plan: row.note.plan,
      tags: row.note.tags || [],
      badgeColor: 'bg-primary-fixed text-on-primary-fixed',
    }));
    
    res.json({ success: true, data: formattedNotes });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const data = req.body;

    const inserted = await db.insert(clinicalNotes).values({
      tenantId,
      patientId: data.patientId,
      // Usaremos un veterinario genérico por defecto si no lo envían para facilitar pruebas MVP
      veterinarianId: data.veterinarianId || '00000000-0000-0000-0000-000000000001', 
      title: data.title,
      type: data.type || 'consulta',
      narrative: data.narrative,
      plan: data.plan,
      temp: data.vitals?.temp,
      heartRate: data.vitals?.fc,
      respRate: data.vitals?.fr,
      weight: data.vitals?.weight,
      tags: data.tags,
    }).returning();

    res.json({ success: true, data: inserted[0] });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno guardando la nota' });
  }
});

export default router;
