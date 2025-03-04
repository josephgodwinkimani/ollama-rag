import { Request, Response } from 'express';
import embeddingService from '../services/embeddingService';
import chromaService from '../services/chromaService';
import ollamaService from '../services/ollamaService';
import { formatRelevantChunks, createRagPrompt } from '../utils/textProcessing';
import config from '../config';

class QueryController {
    // Query documents using RAG approach
    async queryDocuments(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined> {
        const startTime = Date.now();

        try {
            const { query } = req.body;

            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Query is required and must be a string'
                });
            }

            // Generate embedding for the query
            const queryEmbedding: number[] = await embeddingService.generateQueryEmbedding(query);

            // Retrieve similar chunks from ChromaDB
            const { chunks, metadata, distances } = await chromaService.querySimilarChunks(
                queryEmbedding,
                config.retrievalCount
            );

            // Format relevant chunks for display
            const relevantChunks = formatRelevantChunks(chunks, metadata, distances);

            // If no relevant chunks found
            if (chunks.length === 0) {
                return res.status(200).json({
                    success: true,
                    answer: "I couldn't find any relevant code in your uploaded documents to answer this question. Please try uploading more code files or rephrasing your question.",
                    relevantChunks: [],
                    processingTime: Date.now() - startTime
                });
            }

            // Create prompt with retrieved context
            const prompt: string = createRagPrompt(query, chunks);

            // Generate response using LLM
            const answer: string = await ollamaService.generateResponse(prompt);

            res.status(200).json({
                success: true,
                answer,
                relevantChunks,
                processingTime: Date.now() - startTime
            });
        } catch (error: any) {
            console.error('Error querying documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to query documents',
                error: error.message,
                processingTime: Date.now() - startTime
            });
        }
    }
}

export default new QueryController();