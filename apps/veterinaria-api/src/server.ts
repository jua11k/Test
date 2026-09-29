import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tenants', require('./routes/tenants').default);
app.use('/api/portal', require('./routes/portal').default);
app.use('/api/patients', require('./routes/patients').default);
app.use('/api/appointments', require('./routes/appointments').default);
app.use('/api/clients', require('./routes/clients').default);
app.use('/api/clinical-notes', require('./routes/clinical-notes').default);
app.use('/api/ai', require('./routes/ai').default);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'iam-motor' });
});

import path from 'path';

const PORT = process.env.PORT || 4000;

// Servir la aplicación React estática (Vite SPA) en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../veterinaria-web/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
