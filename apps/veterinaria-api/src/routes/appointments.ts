import { Router } from 'express';
import { db, appointments, patients, clients, veterinarians } from '@repo/db';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    
    // JOIN con pacientes, tutores y veterinarios para cumplir el modelo de la UI
    const dbResults = await db.select({
      appointment: appointments,
      patient: patients,
      client: clients,
      veterinarian: veterinarians,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(clients, eq(patients.clientId, clients.id))
    .leftJoin(veterinarians, eq(appointments.veterinarianId, veterinarians.id))
    .where(eq(appointments.tenantId, tenantId));
    
    const formattedAppointments = dbResults.map(row => ({
      ...row.appointment,
      patientName: row.patient.name,
      species: row.patient.species,
      breed: row.patient.breed,
      photoUrl: row.patient.photoUrl,
      tutorName: row.client.name,
      tutorPhone: row.client.phone,
      veterinarianName: row.veterinarian?.name || 'Veterinario General',
      // UI defaults if missing
      durationLabel: `${row.appointment.durationMinutes} min`,
      statusLabel: row.appointment.status === 'en_espera' ? 'En espera' : 'Programada'
    }));
    
    res.json({ success: true, data: formattedAppointments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const data = req.body;

    // Validación mínima y defaults para MVP
    const inserted = await db.insert(appointments).values({
      tenantId,
      sedeId: data.sedeId || '00000000-0000-0000-0000-000000000001', 
      patientId: data.patientId, 
      veterinarianId: data.veterinarianId,
      time: data.time,
      date: new Date(data.date).toISOString().split('T')[0], // format YYYY-MM-DD
      durationMinutes: data.durationMinutes || 30,
      type: data.type || 'consulta',
      status: data.status || 'programada',
      reason: data.reason || 'Consulta General',
      roomBox: data.roomBox || 'Consultorio 1',
    }).returning();

    // Trigger n8n Webhook
    try {
      // 1. Fetch details for the email
      const result = await db.select({
        patientName: patients.name,
        clientName: clients.name,
        clientEmail: clients.email,
        vetName: veterinarians.name
      })
      .from(patients)
      .innerJoin(clients, eq(patients.clientId, clients.id))
      .leftJoin(veterinarians, eq(veterinarians.id, inserted[0].veterinarianId))
      .where(eq(patients.id, inserted[0].patientId))
      .limit(1);

      if (result.length > 0) {
        const details = result[0];
        
        await fetch('https://n8n.ordersmanagementco.com/webhook/manila-appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: inserted[0].id,
            date: inserted[0].date,
            time: inserted[0].time,
            type: inserted[0].type,
            patientName: details.patientName,
            clientName: details.clientName,
            clientEmail: details.clientEmail,
            veterinarianName: details.vetName || 'Veterinario General',
            sedeName: 'Manila Clinic'
          })
        });
      }
    } catch (webhookErr) {
      console.error('Error triggering n8n webhook:', webhookErr);
      // No bloqueamos la respuesta al cliente
    }

    res.json({ success: true, data: inserted[0] });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error interno guardando la cita' });
  }
});

export default router;
