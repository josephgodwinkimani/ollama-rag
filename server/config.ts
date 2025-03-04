import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // Server config
    port: process.env.PORT || 3001,

    // Ollama config
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    llmModel: process.env.LLM_MODEL || 'qwen2.5-coder:7b',
    embeddingModel: process.env.EMBEDDING_MODEL || 'nomic-embed-text',

    // ChromaDB config
    chromaDbPath: process.env.CHROMA_DB_PATH || path.join(__dirname, '../data/chromadb'),
    collectionName: process.env.COLLECTION_NAME || 'code_documents',

    // Document processing
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1000', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200', 10),

    // Temporary storage for uploaded files
    uploadDir: path.join(__dirname, '../uploads'),

    // Number of chunks to retrieve for RAG
    retrievalCount: parseInt(process.env.RETRIEVAL_COUNT || '5', 10),
};