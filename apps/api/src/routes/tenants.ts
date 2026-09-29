import { Router } from 'express';
import { db, tenants } from '@repo/db';
import { eq } from 'drizzle-orm';

const router = Router();

// Endpoint PÚBLICO para resolver la información de la veterinaria por su SLUG
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    
    // Fallback para evitar 404 si la base de datos está recién inicializada o vacía
    if (result.length === 0) {
      if (slug === 'vet-principal' || slug === 'manila-clinic') {
        const fallbackTenant = {
          id: '00000000-0000-0000-0000-000000000001',
          slug: slug,
          name: 'Veterinaria Manila',
          commercialName: 'Manila Vet',
          brandTag: 'Cuidamos a tu mejor amigo',
          logoUrl: null,
          primaryColor: '#00685f',
        };
        return res.json({ success: true, data: fallbackTenant });
      }
      return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    }
    
    // Retornamos solo datos públicos seguros, NO el tenantId si no queremos, 
    // pero el tenantId suele ser necesario para otras llamadas. En este caso lo devolvemos.
    const publicTenant = {
      id: result[0].id,
      slug: result[0].slug,
      name: result[0].name,
      commercialName: result[0].commercialName,
      brandTag: result[0].brandTag,
      logoUrl: result[0].logoUrl,
      primaryColor: result[0].primaryColor,
    };
    
    res.json({ success: true, data: publicTenant });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

export default router;
