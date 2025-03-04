import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import config from '../config';
import documentController from '../controllers/documentController';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(config.uploadDir)) {
            fs.mkdirSync(config.uploadDir, { recursive: true });
        }
        cb(null, config.uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Upload document
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// Get all documents
router.get('/', documentController.getDocuments);

// Get specific document
router.get('/:id', documentController.getDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

export default router;