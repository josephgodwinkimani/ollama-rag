import ollamaService from './ollamaService';
import { DocumentChunk } from '../types';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

class EmbeddingService {
    /**
     * Split a document into chunks suitable for embedding
     */
    splitDocument(document: string, chunkSize: number = config.chunkSize, overlap: number = config.chunkOverlap): string[] {
        // If document is code, try to split at logical boundaries like functions, classes
        const lines = document.split('\n');
        const chunks: string[] = [];
        let currentChunk: string[] = [];
        let currentSize = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            currentChunk.push(line);
            currentSize += line.length;

            // Check if we've reached a logical boundary or chunk size
            const isLogicalBoundary = (
                line.trim() === '' || // Empty line
                line.includes('function ') || // Function declaration
                line.includes('class ') || // Class declaration
                line.includes('interface ') || // Interface declaration
                line.includes('export ') || // Export statement
                line.match(/^\s*\/\//) || // Comment line
                line.includes('{') && line.includes('}') // Single-line block
            );

            if ((currentSize >= chunkSize && isLogicalBoundary) || i === lines.length - 1) {
                chunks.push(currentChunk.join('\n'));

                // Start a new chunk with overlap
                const overlapLines = currentChunk.slice(-Math.ceil(overlap / 30)); // Approximate overlap by lines
                currentChunk = [...overlapLines];
                currentSize = overlapLines.reduce((acc, line) => acc + line.length, 0);
            }
        }

        // If we have leftover content, add it as the final chunk
        if (currentChunk.length > 0 && chunks[chunks.length - 1] !== currentChunk.join('\n')) {
            chunks.push(currentChunk.join('\n'));
        }

        return chunks;
    }

    /**
     * Create document chunks with embeddings
     */
    async createDocumentChunks(
        documentId: string,
        content: string,
        documentName: string,
        fileType: string
    ): Promise<DocumentChunk[]> {
        // Split the document into chunks
        const textChunks = this.splitDocument(content);

        // Create chunks with metadata
        const documentChunks: DocumentChunk[] = [];

        for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i];

            // Generate embedding for the chunk
            const embedding = await ollamaService.generateEmbedding(chunk);

            // Create document chunk object
            const documentChunk: DocumentChunk = {
                id: uuidv4(),
                documentId: documentId,
                content: chunk,
                embedding: embedding,
                metadata: {
                    documentName,
                    fileType,
                    chunkIndex: i
                }
            };

            documentChunks.push(documentChunk);
        }

        return documentChunks;
    }

    /**
     * Generate embedding for a query
     */
    async generateQueryEmbedding(query: string): Promise<number[]> {
        return ollamaService.generateEmbedding(query);
    }
}

export default new EmbeddingService();