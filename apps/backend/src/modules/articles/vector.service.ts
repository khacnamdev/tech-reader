import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { DatabaseService } from "../../database/database.service";
import * as crypto from "crypto";

export interface SimilarChunk {
  articleId: string;
  content: string;
  score: number;
  articleTitle?: string;
  articleSlug?: string;
}

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private ai: GoogleGenAI;

  constructor(private readonly db: DatabaseService) {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generates a 3072-dimension embedding using Google's gemini-embedding-2 model.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Vector embedding generation is unavailable.");
    }

    try {
      const response = await this.ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: text,
      });

      let values: number[] | undefined;
      
      if ("embedding" in response && response.embedding) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        values = (response.embedding as any).values;
      } else if (response.embeddings && response.embeddings.length > 0) {
        values = response.embeddings[0].values;
      }

      if (!values) {
        throw new Error("Failed to extract embedding values from response");
      }

      return values;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${(error as Error).message}`);
      throw new Error(`Embedding generation error: ${(error as Error).message}`);
    }
  }

  /**
   * Saves a document text chunk with its vector embedding.
   */
  async saveChunk(articleId: string, content: string, index: number, embedding: number[]): Promise<void> {
    const chunkId = crypto.randomUUID();
    const vectorString = `[${embedding.join(",")}]`;

    try {
      await this.db.$executeRawUnsafe(
        `INSERT INTO "article_chunks" ("id", "articleId", "content", "chunkIndex", "embedding", "createdAt")
         VALUES ($1, $2, $3, $4, $5::vector, NOW())`,
        chunkId,
        articleId,
        content,
        index,
        vectorString
      );
    } catch (error) {
      this.logger.error(`Failed to save chunk to database: ${(error as Error).message}`);
      throw new Error(`pgvector save error: ${(error as Error).message}`);
    }
  }

  /**
   * Performs semantic vector search on article chunks.
   * Can be filtered by a specific article or searched globally across all user articles.
   */
  async searchSimilarChunks(
    query: string,
    limit: number,
    userId: string,
    articleId?: string
  ): Promise<SimilarChunk[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const vectorString = `[${queryEmbedding.join(",")}]`;

    try {
      let results: SimilarChunk[] = [];
      if (articleId) {
        // Query scoped to a single article
        results = await this.db.$queryRawUnsafe<SimilarChunk[]>(
          `SELECT 
            c."articleId", 
            c."content", 
            1 - (c."embedding" <=> $1::vector) AS "score",
            a."title" AS "articleTitle",
            a."slug" AS "articleSlug"
           FROM "article_chunks" c
           INNER JOIN "articles" a ON c."articleId" = a."id"
           WHERE a."userId" = $2 AND a."id" = $3
           ORDER BY c."embedding" <=> $1::vector 
           LIMIT $4`,
          vectorString,
          userId,
          articleId,
          limit
        );
      } else {
        // Global query scoped to the user
        results = await this.db.$queryRawUnsafe<SimilarChunk[]>(
          `SELECT 
            c."articleId", 
            c."content", 
            1 - (c."embedding" <=> $1::vector) AS "score",
            a."title" AS "articleTitle",
            a."slug" AS "articleSlug"
           FROM "article_chunks" c
           INNER JOIN "articles" a ON c."articleId" = a."id"
           WHERE a."userId" = $2
           ORDER BY c."embedding" <=> $1::vector 
           LIMIT $3`,
          vectorString,
          userId,
          limit
        );
      }

      return results;
    } catch (error) {
      this.logger.error(`Error querying vector chunks: ${(error as Error).message}`);
      throw new Error(`pgvector query error: ${(error as Error).message}`);
    }
  }
}
