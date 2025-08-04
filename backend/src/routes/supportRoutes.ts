import * as express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { 
  createSupport, 
  getAllSupport, 
  getUserSupport,
  getSupportById, 
  updateSupport, 
  deleteSupport, 
  getSupportStats 
} from '../controllers/supportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Ensure support attachments directory exists
const supportAttachmentsDir = path.join(__dirname, '../../assets/support-attachments');
if (!fs.existsSync(supportAttachmentsDir)) {
  fs.mkdirSync(supportAttachmentsDir, { recursive: true });
}

// Configure multer for support attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, supportAttachmentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images, PDFs, text files, logs, and documents
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, text files, and documents are allowed.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  }
});

// User routes (require authentication)
router.post('/', authMiddleware, (req, res, next) => {
  upload.array('attachments', 5)(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size must be less than 10MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Maximum 5 files allowed' });
        }
      } else if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'File upload error', error: err.message });
    }
    next();
  });
}, createSupport);
router.get('/my-tickets', authMiddleware, getUserSupport);
router.get('/my-tickets/:id', authMiddleware, getSupportById);

// Admin routes (require authentication and permissions)
router.get('/', authMiddleware, getAllSupport);
router.get('/stats', authMiddleware, getSupportStats);
router.get('/:id', authMiddleware, getSupportById);
router.put('/:id', authMiddleware, updateSupport);
router.delete('/:id', authMiddleware, deleteSupport);

export default router; 