import { Request, Response } from 'express';
import fs from 'fs';
import path from 'node:path';
import { detectFileType } from '../utils/textProcessing';
import documentService from '../services/documentService';

class DocumentController {
    /**
     * Upload and process a document
     */
    async uploadDocument(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Read file content
            const filePath: string = req.file.path;
            const fileContent: string = fs.readFileSync(filePath, 'utf-8');

            // Get original filename and detect file type
            const originalName: string = req.file.originalname;
            const fileType: string = detectFileType(originalName, fileContent);

            // Process the document
            const document = await documentService.processDocument(
                originalName,
                fileContent,
                fileType
            );

            // Delete the temporary uploaded file
            fs.unlinkSync(filePath);

            res.status(201).json({
                success: true,
                message: 'Document uploaded and processed successfully',
                document: {
                    id: document.id,
                    name: document.name,
                    fileType: document.fileType,
                    uploadDate: document.uploadDate
                }
            });
        } catch (error: any) {
            console.error('Error uploading document:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload document',
                error: error.message
            });
        }
    }

    /**
     * Get all documents
     */
    getDocuments(req: Request, res: Response) {
        try {
            const documents = documentService.listDocuments();

            // Don't include file content in the response
            const sanitizedDocuments = documents.map(doc => ({
                id: doc.id,
                name: doc.name,
                fileType: doc.fileType,
                uploadDate: doc.uploadDate
            }));

            res.status(200).json({
                success: true,
                documents: sanitizedDocuments
            });
        } catch (error: any) {
            console.error('Error getting documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get documents',
                error: error.message
            });
        }
    }

    /**
     * Get specific document
     */
    getDocument(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const document = documentService.getDocument(id);

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            res.status(200).json({
                success: true,
                document: {
                    id: document.id,
                    name: document.name,
                    content: document.content,
                    fileType: document.fileType,
                    uploadDate: document.uploadDate
                }
            });
        } catch (error: any) {
            console.error('Error getting document:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get document',
                error: error.message
            });
        }
    }

    /**
     * Delete document
     */
    async deleteDocument(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Check if document exists
            const document = documentService.getDocument(id);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            // Remove document and its chunks
            await documentService.removeDocument(id);

            res.status(200).json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error: any) {
            console.error('Error deleting document:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete document',
                error: error.message
            });
        }
    }
}

export default new DocumentController();