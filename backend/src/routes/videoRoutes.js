import { Router } from 'express';
import { streamVideo } from '../controllers/videoController.js';

const router = Router();

// Matches GET /api/stream
router.get('/stream', streamVideo);

export default router;