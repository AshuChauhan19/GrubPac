import express from 'express';
import { getLiveContent } from '../controllers/broadcastController.js';

const router = express.Router();

// Public route for students
router.get('/live/:teacherId', getLiveContent);

export default router;
