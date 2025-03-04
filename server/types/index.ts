export interface Document {
    id: string;
    name: string;
    content: string;
    fileType: string;
    uploadDate: Date;
}

export interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    embedding?: number[];
    metadata: {
        documentName: string;
        fileType: string;
        chunkIndex: number;
    };
}

export interface QueryResult {
    answer: string;
    relevantChunks: {
        content: string;
        documentName: string;
        similarity: number;
    }[];
    processingTime: number;
}

export interface EmbeddingResponse {
    embedding: number[];
}

export interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
        num_predict?: number;
    };
}

export interface OllamaGenerateResponse {
    model: string;
    response: string;
    done: boolean;
}

export interface OllamaEmbeddingRequest {
    model: string;
    prompt: string;
}

export interface OllamaEmbeddingResponse {
    embedding: number[];
}