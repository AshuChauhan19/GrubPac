import express from 'express';
import { 
  uploadContent, 
  getMyContent, 
  getAllContent, 
  getPendingContent, 
  reviewContent 
} from '../controllers/contentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, authorize('teacher'), upload.single('file'), uploadContent);
router.get('/my-content', protect, authorize('teacher'), getMyContent);
router.get('/all', protect, authorize('principal'), getAllContent);
router.get('/pending', protect, authorize('principal'), getPendingContent);
router.put('/review/:id', protect, authorize('principal'), reviewContent);

export default router;
