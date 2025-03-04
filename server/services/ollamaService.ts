import axios from 'axios';
import config from '../config';
import { OllamaGenerateRequest, OllamaGenerateResponse, OllamaEmbeddingRequest, OllamaEmbeddingResponse } from '../types';

class OllamaService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.ollamaBaseUrl;
    }

    /**
     * Generate text response from LLM
     */
    async generateResponse(prompt: string, model: string = config.llmModel): Promise<string> {
        try {
            const request: OllamaGenerateRequest = {
                model,
                prompt,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    top_k: 40,
                }
            };

            const response = await axios.post<OllamaGenerateResponse>(
                `${this.baseUrl}/api/generate`,
                request
            );

            return response.data.response;
        } catch (error) {
            console.error('Error generating response from Ollama:', error);
            throw new Error('Failed to generate response from LLM');
        }
    }

    /**
     * Generate embeddings for a text
     */
    async generateEmbedding(text: string, model: string = config.embeddingModel): Promise<number[]> {
        try {
            const request: OllamaEmbeddingRequest = {
                model,
                prompt: text
            };

            const response = await axios.post<OllamaEmbeddingResponse>(
                `${this.baseUrl}/api/embeddings`,
                request
            );

            return response.data.embedding;
        } catch (error) {
            console.error('Error generating embeddings from Ollama:', error);
            throw new Error('Failed to generate embeddings');
        }
    }

    /**
     * Check if Ollama server is running
     */
    async healthCheck(): Promise<boolean> {
        try {
            await axios.get(`${this.baseUrl}/api/tags`);
            return true;
        } catch (error) {
            console.error('zzzzzz! Ollama server is not running or not accessible');
            return false;
        }
    }
}

export default new OllamaService();