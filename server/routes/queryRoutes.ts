import express from 'express';
import queryController from '../controllers/queryController';

const router = express.Router();

// Query the RAG system
router.post('/', queryController.queryDocuments);

export default router;