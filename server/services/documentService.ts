import { Document } from '../types';
import fs from 'fs';
import path from 'path';
import config from '../config';
import { v4 as uuidv4 } from 'uuid';
import embeddingService from './embeddingService';
import chromaService from './chromaService';

class DocumentService {
    private documentsDir: string;

    constructor() {
        this.documentsDir = path.join(config.uploadDir, 'documents');
        if (!fs.existsSync(this.documentsDir)) {
            fs.mkdirSync(this.documentsDir, { recursive: true });
        }
    }

    /**
     * Process and store a uploaded document
     */
    async processDocument(
        filename: string,
        fileContent: string,
        fileType: string
    ): Promise<Document> {
        try {
            // Check if document with same name already exists
            const existingDocs = this.listDocuments();
            const existingDoc = existingDocs.find(doc => doc.name === filename);
            if (existingDoc) {
                console.log(`Document "${filename}" already exists with ID: ${existingDoc.id}`);
                return existingDoc;
            }

            // Create document record
            const documentId = uuidv4();
            const document: Document = {
                id: documentId,
                name: filename,
                content: fileContent,
                fileType: fileType,
                uploadDate: new Date()
            };

            // Save document file
            const filePath = path.join(this.documentsDir, `${documentId}.txt`);
            fs.writeFileSync(filePath, fileContent);

            // Create document chunks and generate embeddings
            const documentChunks = await embeddingService.createDocumentChunks(
                documentId,
                fileContent,
                filename,
                fileType
            );

            // store chunks in ChromaDB
            await chromaService.addDocumentChunks(documentChunks);

            return document;
        } catch (error) {
            console.error('Error processing document:', error);
            throw new Error('Failed to process document');
        }
    }

    // Remove a document and its chunks
    async removeDocument(documentId: string): Promise<void> {
        try {
            const filePath = path.join(this.documentsDir, `${documentId}.txt`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Delete document chunks
            await chromaService.deleteDocumentChunks(documentId);
        } catch (error) {
            console.error('Error removing document:', error);
            throw new Error('Failed to remove document');
        }
    }

    /**
     * Get document by ID
     */
    getDocument(documentId: string): Document | null {
        try {
            const filePath = path.join(this.documentsDir, `${documentId}.txt`);
            if (!fs.existsSync(filePath)) {
                return null;
            }

            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const documentMetaPath = path.join(this.documentsDir, `${documentId}.meta.json`);

            let metadata = {
                name: `document_${documentId}`,
                fileType: 'text/plain',
                uploadDate: new Date()
            };

            if (fs.existsSync(documentMetaPath)) {
                metadata = JSON.parse(fs.readFileSync(documentMetaPath, 'utf-8'));
            }

            return {
                id: documentId,
                content: fileContent,
                ...metadata
            };
        } catch (error) {
            console.error('Error getting document:', error);
            return null;
        }
    }

    /**
     * List all documents
     */
    listDocuments(): Document[] {
        try {
            const documents: Document[] = [];
            const files = fs.readdirSync(this.documentsDir);

            // Filter for document files (not metadata files)
            const documentFiles = files.filter(file =>
                file.endsWith('.txt') && !file.includes('.meta.')
            );

            for (const file of documentFiles) {
                const documentId = file.replace('.txt', '');
                const document = this.getDocument(documentId);
                if (document) {
                    documents.push(document);
                }
            }

            return documents;
        } catch (error) {
            console.error('Error listing documents:', error);
            return [];
        }
    }
}

export default new DocumentService();