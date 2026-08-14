import express from 'express';
import cors from 'cors';
import { CORS_ORIGIN } from './config/env.js';
import videoRoutes from './routes/videoRoutes.js';

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Express Endpoints
app.use('/api', videoRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;