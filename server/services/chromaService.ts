import { AddRecordsParams, ChromaClient, Collection, GetCollectionParams, OpenAIEmbeddingFunction, QueryRecordsParams } from 'chromadb';
import { DocumentChunk } from '../types';
import config from '../config';
import fs from 'node:fs';
import path from 'node:path';

class ChromaService {
    private client: ChromaClient;
    private collection: Collection | null = null;
    private initialized: boolean = false;

    constructor() {
        this.client = new ChromaClient({
            path: `http://localhost:8000` // ChromaDB runs on default port 8000
        });
    }

    /**
     * Initialize ChromaDB and create collection if it doesn't exist
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Make sure the ChromaDB directory exists
            if (!fs.existsSync(config?.chromaDbPath)) {
                fs.mkdirSync(config?.chromaDbPath, { recursive: true });
            }

            // Check if collection exists, if not create it
            const collections = await this.client.listCollections();
            const collectionExists = collections.some(c => c?.name === config?.collectionName);

            if (collectionExists) {
                this.collection = await this.client.getCollection({
                    name: config?.collectionName
                } as GetCollectionParams);
            } else {
                this.collection = await this.client.createCollection({
                    name: config?.collectionName,
                    metadata: {
                        description: "Code document collection for RAG"
                    }
                });
            }

            this.initialized = true;
            console.log(`ChromaDB initialized with collection: ${config?.collectionName}`);
        } catch (error) {
            console.error('Error initializing ChromaDB:', error);
            throw new Error('Failed to initialize ChromaDB');
        }
    }

    /**
     * Add document chunks to ChromaDB collection
     */
    async addDocumentChunks(chunks: DocumentChunk[]): Promise<void> {
        await this.initialize();

        try {
            if (!this.collection) {
                throw new Error('Collection not initialized');
            }

            const ids = chunks.map(chunk => chunk.id);
            const documents = chunks.map(chunk => chunk.content);
            const embeddings = chunks.map(chunk => chunk.embedding);
            const metadatas = chunks.map(chunk => chunk.metadata);

            // Add dis chunks to collection
            await this.collection.add({
                ids,
                documents,
                embeddings,
                metadatas
            } as AddRecordsParams);

            console.log(`Added ${chunks.length} chunks to ChromaDB collection`);
        } catch (error) {
            console.error('Error adding chunks to ChromaDB:', error);
            throw new Error('Failed to add document chunks to ChromaDB');
        }
    }

    /**
     * Query ChromaDB for similar chunks based on embedding
     */
    async querySimilarChunks(embedding: number[], limit: number = config.retrievalCount): Promise<{
        chunks: string[];
        metadata: any[];
        distances: number[];
    }> {
        await this.initialize();

        try {
            if (!this.collection) {
                throw new Error('Collection not initialized');
            }

            const results = await this.collection.query({
                queryEmbeddings: [embedding],
                nResults: limit,
                include: ["documents", "metadatas", "distances"]
            } as QueryRecordsParams);

            return {
                chunks: results.documents[0] as string[],
                metadata: results.metadatas[0] as any[],
                distances: results.distances ? results.distances[0] as number[] : []
            };
        } catch (error) {
            console.error('Error querying ChromaDB:', error);
            throw new Error('Failed to query similar chunks from ChromaDB');
        }
    }

    /**
     * Delete document chunks by document id
     */
    async deleteDocumentChunks(documentId: string): Promise<void> {
        await this.initialize();

        try {
            if (!this.collection) {
                throw new Error('Collection not initialized');
            }

            // Get chunks for this document
            const results = await this.collection.get({
                where: { documentId }
            });

            if (results.ids.length > 0) {
                await this.collection.delete({
                    ids: results.ids
                });
                console.log(`Deleted ${results.ids.length} chunks for document ${documentId}`);
            }
        } catch (error) {
            console.error('Error deleting chunks from ChromaDB:', error);
            throw new Error('Failed to delete document chunks from ChromaDB');
        }
    }
}

export default new ChromaService();