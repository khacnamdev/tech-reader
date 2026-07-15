import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";

export interface AIEnrichedData {
  title: string;
  summary: string;
  translation: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimated_reading_time: number;
  category: string;
  tags: string[];
  key_points: string[];
  vocabulary: Array<{
    word: string;
    definition: string;
    meaning: string;
    pronunciation: string;
    example: string;
    when_to_use: string;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  }>;
  tech_terms: Array<{
    term: string;
    definition: string;
    why_it_exists: string;
    how_it_works: string;
    architecture_desc: string;
    advantages: string[];
    disadvantages: string[];
    real_world_examples: string[];
    related_tech: string[];
    best_practices: string[];
    common_mistakes: string[];
  }>;
}

@Injectable()
export class AIEnrichedService {
  private readonly logger = new Logger(AIEnrichedService.name);
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = new GoogleGenAI({ apiKey });
  }

  async enrichArticle(markdownContent: string, targetLanguage = "VI"): Promise<AIEnrichedData> {
    this.logger.log(`Initiating Gemini article enrichment for target language: ${targetLanguage}`);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Article enrichment is unavailable.");
    }

    const systemInstruction = `You are an expert staff software engineer and technical translator. 
Your task is to analyze the provided markdown engineering article and return a highly detailed, structured JSON object containing translations, vocabulary explanations, and conceptual metadata.

CRITICAL RULES:
1. Translate the main body prose of the article into the user's preferred language code: ${targetLanguage}.
2. DO NOT translate technical words, names of frameworks, runtime libraries, protocols, or infrastructure components (e.g. Suspense, Fiber, Hydration, AST, GC, Redis, Docker, Prisma, NestJS). Keep them in their original English form in the translation body.
3. Extract key english vocabulary words that would benefit an intermediate developer learning English.
4. Extract advanced computer science and systems architecture terms (e.g., Hydration) and explain them deeply as requested.`;

    const schema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        summary: { type: "STRING" },
        translation: { type: "STRING" },
        difficulty: { type: "STRING", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
        estimated_reading_time: { type: "INTEGER" },
        category: { type: "STRING" },
        tags: { type: "ARRAY", items: { type: "STRING" } },
        key_points: { type: "ARRAY", items: { type: "STRING" } },
        vocabulary: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              word: { type: "STRING" },
              definition: { type: "STRING" },
              meaning: { type: "STRING" },
              pronunciation: { type: "STRING" },
              example: { type: "STRING" },
              when_to_use: { type: "STRING" },
              difficulty: { type: "STRING", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] }
            },
            required: ["word", "definition", "meaning", "pronunciation", "example", "when_to_use", "difficulty"]
          }
        },
        tech_terms: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              term: { type: "STRING" },
              definition: { type: "STRING" },
              why_it_exists: { type: "STRING" },
              how_it_works: { type: "STRING" },
              architecture_desc: { type: "STRING" },
              advantages: { type: "ARRAY", items: { type: "STRING" } },
              disadvantages: { type: "ARRAY", items: { type: "STRING" } },
              real_world_examples: { type: "ARRAY", items: { type: "STRING" } },
              related_tech: { type: "ARRAY", items: { type: "STRING" } },
              best_practices: { type: "ARRAY", items: { type: "STRING" } },
              common_mistakes: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: [
              "term", "definition", "why_it_exists", "how_it_works", "architecture_desc",
              "advantages", "disadvantages", "real_world_examples", "related_tech", "best_practices", "common_mistakes"
            ]
          }
        }
      },
      required: [
        "title", "summary", "translation", "difficulty", "estimated_reading_time",
        "category", "tags", "key_points", "vocabulary", "tech_terms"
      ]
    };

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: markdownContent,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          responseSchema: schema as any,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini API");
      }

      return JSON.parse(responseText) as AIEnrichedData;
    } catch (error) {
      this.logger.error(`Error querying Gemini: ${(error as Error).message}`);
      throw new Error(`AI enrichment process failed: ${(error as Error).message}`);
    }
  }
}
