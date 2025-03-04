export interface Document {
    id: string;
    name: string;
    fileType: string;
    uploadDate: string;
}

export interface UploadResponse {
    success: boolean;
    message: string;
    document?: Document;
    error?: string;
}

export interface DocumentsResponse {
    success: boolean;
    documents: Document[];
    error?: string;
}

export interface QueryResponse {
    success: boolean;
    answer: string;
    relevantChunks: RelevantChunk[];
    processingTime: number;
    error?: string;
}

export interface RelevantChunk {
    content: string;
    documentName: string;
    similarity: number;
}