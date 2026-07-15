import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";

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
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.openai = new OpenAI({ apiKey });
  }

  async enrichArticle(markdownContent: string, targetLanguage = "VI"): Promise<AIEnrichedData> {
    this.logger.log(`Initiating OpenAI article enrichment for target language: ${targetLanguage}`);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not configured. Article enrichment is unavailable.");
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert staff software engineer and technical translator. 
Your task is to analyze the provided markdown engineering article and return a highly detailed, structured JSON object containing translations, vocabulary explanations, and conceptual metadata.

CRITICAL RULES:
1. Translate the main body prose of the article into the user's preferred language code: ${targetLanguage}.
2. DO NOT translate technical words, names of frameworks, runtime libraries, protocols, or infrastructure components (e.g. Suspense, Fiber, Hydration, AST, GC, Redis, Docker, Prisma, NestJS). Keep them in their original English form in the translation body.
3. Extract key english vocabulary words that would benefit an intermediate developer learning English.
4. Extract advanced computer science and systems architecture terms (e.g., Hydration) and explain them deeply as requested.`,
          },
          {
            role: "user",
            content: markdownContent,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "article_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                translation: { type: "string" },
                difficulty: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
                estimated_reading_time: { type: "integer" },
                category: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                key_points: { type: "array", items: { type: "string" } },
                vocabulary: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      definition: { type: "string" },
                      meaning: { type: "string" },
                      pronunciation: { type: "string" },
                      example: { type: "string" },
                      when_to_use: { type: "string" },
                      difficulty: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] }
                    },
                    required: ["word", "definition", "meaning", "pronunciation", "example", "when_to_use", "difficulty"],
                    additionalProperties: false
                  }
                },
                tech_terms: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      term: { type: "string" },
                      definition: { type: "string" },
                      why_it_exists: { type: "string" },
                      how_it_works: { type: "string" },
                      architecture_desc: { type: "string" },
                      advantages: { type: "array", items: { type: "string" } },
                      disadvantages: { type: "array", items: { type: "string" } },
                      real_world_examples: { type: "array", items: { type: "string" } },
                      related_tech: { type: "array", items: { type: "string" } },
                      best_practices: { type: "array", items: { type: "string" } },
                      common_mistakes: { type: "array", items: { type: "string" } }
                    },
                    required: [
                      "term", "definition", "why_it_exists", "how_it_works", "architecture_desc",
                      "advantages", "disadvantages", "real_world_examples", "related_tech", "best_practices", "common_mistakes"
                    ],
                    additionalProperties: false
                  }
                }
              },
              required: [
                "title", "summary", "translation", "difficulty", "estimated_reading_time",
                "category", "tags", "key_points", "vocabulary", "tech_terms"
              ],
              additionalProperties: false
            }
          }
        }
      });

      const responseText = response.choices[0].message.content;
      if (!responseText) {
        throw new Error("Empty response received from OpenAI API");
      }

      return JSON.parse(responseText) as AIEnrichedData;
    } catch (error) {
      this.logger.error(`Error querying OpenAI: ${(error as Error).message}`);
      throw new Error(`AI enrichment process failed: ${(error as Error).message}`);
    }
  }
}
