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
    const apiKey = process.env.OPENAI_API_KEY || "placeholder-key";
    this.openai = new OpenAI({ apiKey });
  }

  async enrichArticle(markdownContent: string, targetLanguage = "VI"): Promise<AIEnrichedData> {
    this.logger.log(`Initiating OpenAI article enrichment for target language: ${targetLanguage}`);

    // If API key is empty/placeholder, return a mocked structure to avoid throwing errors during setup/offline dev
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn("OPENAI_API_KEY is not set. Returning mock parsed data.");
      return this.getMockEnrichedData(targetLanguage);
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

  private getMockEnrichedData(_targetLanguage: string): AIEnrichedData {
    return {
      title: "React 19 Server Components Explained",
      summary: "This article introduces the design patterns and optimizations behind React Server Components in React 19.",
      translation: `React Server Components (RSC) là một tính năng mới nổi bật trong React 19. RSC cho phép chạy các component trực tiếp trên server thay vì tải JavaScript bundle xuống client. 
      Bằng việc sử dụng RSC, thời gian tải trang ban đầu sẽ giảm đáng kể và cải thiện SEO do HTML được render sẵn từ server. Qúa trình Hydration trên client sẽ nhẹ hơn.`,
      difficulty: "INTERMEDIATE",
      estimated_reading_time: 5,
      category: "Frontend Dev",
      tags: ["React", "Next.js", "Server Components"],
      key_points: [
        "RSC executes exclusively on the backend, reducing client bundles.",
        "Improves initial page loads and hydration performance.",
        "Technical terminology like Hydration and Fiber are preserved in English."
      ],
      vocabulary: [
        {
          word: "mitigate",
          definition: "make less severe, serious, or painful",
          meaning: "giảm thiểu, giảm bớt",
          pronunciation: "/ˈmɪt.ɪ.ɡeɪt/",
          example: "We can use caching to mitigate network latency issues.",
          when_to_use: "When discussing software optimizations or risk management.",
          difficulty: "INTERMEDIATE"
        }
      ],
      tech_terms: [
        {
          term: "Hydration",
          definition: "The process of attaching event listeners to static server-rendered HTML on the client side.",
          why_it_exists: "To make static pages interactive after fast HTML load from backend.",
          how_it_works: "React walks the server-rendered DOM nodes and attaches React event handlers to make them alive.",
          architecture_desc: "Runs after client bundles load, matching the virtual tree with the actual DOM nodes.",
          advantages: ["Fast initial visual load", "Improves SEO"],
          disadvantages: ["Can cause hydration mismatch errors if server HTML doesn't match client state", "Blocks CPU during bootup"],
          real_world_examples: ["Next.js App Router default page loading"],
          related_tech: ["Server-Side Rendering (SSR)", "Suspense"],
          best_practices: ["Avoid direct window/document references inside rendering lifecycle before mounts"],
          common_mistakes: ["Using dynamic dates or local state conditional classes directly in SSR elements"]
        }
      ]
    };
  }
}
