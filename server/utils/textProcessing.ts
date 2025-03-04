import { DocumentChunk } from '../types';
import path from 'node:path';

// Detect file type based on extension or content
export function detectFileType(filename: string, content: string): string {
    const ext = path.extname(filename).toLowerCase();

    // Check by file extension
    switch (ext) {
        case '.js':
            return 'javascript';
        case '.jsx':
            return 'jsx';
        case '.ts':
            return 'typescript';
        case '.tsx':
            return 'tsx';
        case '.py':
            return 'python';
        case '.java':
            return 'java';
        case '.c':
            return 'c';
        case '.cpp':
        case '.cc':
        case '.cxx':
            return 'cpp';
        case '.cs':
            return 'csharp';
        case '.go':
            return 'go';
        case '.rb':
            return 'ruby';
        case '.php':
            return 'php';
        case '.swift':
            return 'swift';
        case '.rs':
            return 'rust';
        case '.kt':
        case '.kts':
            return 'kotlin';
        case '.scala':
            return 'scala';
        case '.dart':
            return 'dart';
        case '.html':
            return 'html';
        case '.css':
            return 'css';
        case '.json':
            return 'json';
        case '.xml':
            return 'xml';
        case '.yaml':
        case '.yml':
            return 'yaml';
        case '.md':
            return 'markdown';
        case '.sh':
            return 'shell';
        case '.sql':
            return 'sql';
        default:
            // Try to infer from content if extension is not recognized
            if (content.includes('function') && content.includes('{') && content.includes('}')) {
                if (content.includes('export') || content.includes('import ')) {
                    return 'javascript';
                }
                return 'javascript';
            }
            if (content.includes('class') && content.includes('{') && content.includes('public')) {
                return 'java';
            }
            if (content.includes('def ') && content.includes(':')) {
                return 'python';
            }
            return 'plaintext';
    }
}

/**
 * Format relevant chunks for display
 */
export function formatRelevantChunks(
    chunks: string[],
    metadata: any[],
    distances: number[]
): {
    content: string;
    documentName: string;
    similarity: number;
}[] {
    return chunks.map((chunk, index) => {
        // Calculate similarity score from distance
        // Lower distance means higher similarity
        const distance: number = distances[index] || 0;
        const similarity: number = Math.max(0, 1 - distance);

        return {
            content: chunk,
            documentName: metadata[index]?.documentName || 'Unknown',
            similarity: parseFloat(similarity.toFixed(4))
        };
    });
}

// Create a prompt for the Ollama LLM using retrieved context
export function createRagPrompt(query: string, chunks: string[]): string {
    const contextText: string = chunks.join('\n\n');

    return `You are a helpful assistant that answers questions about code. 
Below is relevant context from the user's codebase:

---BEGIN CONTEXT---
${contextText}
---END CONTEXT---

Based on the provided context, answer the following question as accurately as possible.
If the context doesn't contain enough information to provide a complete answer, 
say so and explain what additional information would be helpful.

Given the context information and not prior knowledge, answer the following question:
${query}

Your answer should:
1. Be based only on the provided context
2. Be comprehensive and detailed
3. Directly address the query

ANSWER:`;
}