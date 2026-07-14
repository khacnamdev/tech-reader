import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { CrawlerService } from "./crawler.service";
import { AIEnrichedService } from "./ai-enrichment.service";
import { VectorService } from "./vector.service";
import { Difficulty } from "@prisma/client";

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly crawlerService: CrawlerService,
    private readonly aiEnrichedService: AIEnrichedService,
    private readonly vectorService: VectorService
  ) {}

  /**
   * Orchestrates the complete ingestion pipeline:
   * 1. Crawls webpage & cleans HTML to markdown
   * 2. Runs OpenAI Structured Output analysis (summarization, translation, vocab, tech terms)
   * 3. Chunks the markdown content & generates pgvector embeddings
   * 4. Persists all structured knowledge inside relational DB
   */
  async ingestFromUrl(userId: string, url: string, targetLanguage = "VI") {
    this.logger.log(`Beginning article ingestion: URL=${url}, User=${userId}`);

    // Clean up url string
    const targetUrl = url.trim();

    // Prevent duplicate urls for the same user
    const parsedUrl = new URL(targetUrl);
    const slug = this.generateSlug(parsedUrl.pathname || "article");

    const existingArticle = await this.db.article.findFirst({
      where: { userId, slug },
    });

    if (existingArticle) {
      this.logger.warn(`Article with slug '${slug}' already exists for user ${userId}`);
      return existingArticle;
    }

    // 1. Crawl raw content
    const crawledData = await this.crawlerService.crawl(targetUrl);

    // 2. Query AI enrichment
    const enrichedData = await this.aiEnrichedService.enrichArticle(
      crawledData.cleanMarkdown,
      targetLanguage
    );

    // 3. Save relational data in a transactional format
    const article = await this.db.$transaction(async (tx) => {
      const art = await tx.article.create({
        data: {
          userId,
          title: enrichedData.title || crawledData.title,
          slug,
          sourceUrl: crawledData.sourceUrl,
          sourceDomain: crawledData.sourceDomain,
          author: crawledData.author,
          publishedAt: crawledData.publishedAt,
          rawHtml: crawledData.rawHtml,
          cleanMarkdown: crawledData.cleanMarkdown,
          translationMarkdown: enrichedData.translation,
          summary: enrichedData.summary,
          difficulty: enrichedData.difficulty as Difficulty,
          estimatedReadingTime: enrichedData.estimated_reading_time,
          categoryName: enrichedData.category,
        },
      });

      // Save Key Points
      if (enrichedData.key_points && enrichedData.key_points.length > 0) {
        await tx.keyPoint.createMany({
          data: enrichedData.key_points.map((p) => ({
            articleId: art.id,
            point: p,
          })),
        });
      }

      // Save Vocabulary Cards
      if (enrichedData.vocabulary && enrichedData.vocabulary.length > 0) {
        await tx.vocabulary.createMany({
          data: enrichedData.vocabulary.map((v) => ({
            articleId: art.id,
            word: v.word,
            definition: v.definition,
            meaning: v.meaning,
            pronunciation: v.pronunciation,
            exampleSentence: v.example,
            whenToUse: v.when_to_use,
            difficulty: v.difficulty as Difficulty,
          })),
        });
      }

      // Save Technical Terms
      if (enrichedData.tech_terms && enrichedData.tech_terms.length > 0) {
        for (const t of enrichedData.tech_terms) {
          await tx.technicalTerm.create({
            data: {
              articleId: art.id,
              term: t.term,
              definition: t.definition,
              whyItExists: t.why_it_exists,
              howItWorks: t.how_it_works,
              architectureDesc: t.architecture_desc,
              advantages: t.advantages,
              disadvantages: t.disadvantages,
              realWorldExamples: t.real_world_examples,
              relatedTech: t.related_tech,
              bestPractices: t.best_practices,
              commonMistakes: t.common_mistakes,
            },
          });
        }
      }

      // Initialize reading progress
      await tx.readingProgress.create({
        data: {
          articleId: art.id,
          scrollPercentage: 0,
          isCompleted: false,
        },
      });

      // Update user statistics counter
      await tx.learningStatistic.update({
        where: { userId },
        data: {
          articlesRead: { increment: 1 },
          totalReadingTime: { increment: enrichedData.estimated_reading_time },
        },
      });

      return art;
    });

    // 4. Generate chunks & embeddings for vector search (Non-blocking database insertion)
    // Run asynchronously to allow fast controller response
    this.processEmbeddingsInBackground(article.id, crawledData.cleanMarkdown).catch((err) => {
      this.logger.error(`Failed background embedding process for article ${article.id}: ${err.message}`);
    });

    return article;
  }

  private async processEmbeddingsInBackground(articleId: string, content: string) {
    this.logger.log(`Starting background embedding processing for article ${articleId}`);
    const chunks = this.chunkText(content);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await this.vectorService.generateEmbedding(chunkText);
      await this.vectorService.saveChunk(articleId, chunkText, i, embedding);
    }
    
    this.logger.log(`Completed embedding synchronization for article ${articleId} (${chunks.length} chunks generated)`);
  }

  /**
   * Paragraph-aware markdown text chunking helper.
   * Splits markdown by paragraphs, keeping chunks around 1000 characters.
   */
  private chunkText(text: string, chunkSize = 1000): string[] {
    const paragraphs = text.split("\n\n");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      if ((currentChunk + "\n\n" + paragraph).length > chunkSize) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        
        // If single paragraph is larger than chunkSize, chunk it by lines
        if (paragraph.length > chunkSize) {
          const lines = paragraph.split("\n");
          let subChunk = "";
          for (const line of lines) {
            if ((subChunk + "\n" + line).length > chunkSize) {
              if (subChunk.trim()) chunks.push(subChunk.trim());
              subChunk = line;
            } else {
              subChunk = subChunk ? subChunk + "\n" + line : line;
            }
          }
          currentChunk = subChunk;
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk = currentChunk ? currentChunk + "\n\n" + paragraph : paragraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private generateSlug(pathname: string): string {
    const parts = pathname.split("/").filter(Boolean);
    const filename = parts[parts.length - 1] || "article";
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 80);
  }

  /**
   * Library listing retrieval.
   */
  async findAll(userId: string, query: { page?: number; limit?: number; folderId?: string; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = { userId };
    
    if (query.folderId) {
      whereClause.folderId = query.folderId === "null" ? null : query.folderId;
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { summary: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.db.article.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          readingProgress: true,
          tags: true,
        },
      }),
      this.db.article.count({ where: whereClause }),
    ]);

    return {
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Detailed article fetching with relation sub-entities.
   */
  async findOne(id: string, userId: string) {
    const article = await this.db.article.findFirst({
      where: { id, userId },
      include: {
        vocabularies: { orderBy: { createdAt: "asc" } },
        technicalTerms: { orderBy: { createdAt: "asc" } },
        keyPoints: { orderBy: { createdAt: "asc" } },
        notes: true,
        highlights: true,
        readingProgress: true,
        folder: true,
      },
    });

    if (!article) {
      throw new NotFoundException("Article not found in library");
    }

    // Log this view event to ReadingHistory
    await this.db.readingHistory.create({
      data: {
        userId,
        articleId: article.id,
      },
    });

    return article;
  }

  async delete(id: string, userId: string) {
    const article = await this.db.article.findFirst({
      where: { id, userId },
    });

    if (!article) {
      throw new NotFoundException("Article not found in library");
    }

    await this.db.article.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Updates scrolling state indicators.
   */
  async updateProgress(articleId: string, userId: string, scrollPercentage: number) {
    const article = await this.db.article.findFirst({
      where: { id: articleId, userId },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const isCompleted = scrollPercentage >= 95;

    return this.db.readingProgress.update({
      where: { articleId },
      data: {
        scrollPercentage,
        isCompleted,
        lastReadAt: new Date(),
      },
    });
  }

  /**
   * Create annotations & text highlights.
   */
  async saveHighlight(userId: string, articleId: string, data: { selectedText: string; serializedDom?: string; color?: string; noteContent?: string }) {
    return this.db.highlight.create({
      data: {
        userId,
        articleId,
        selectedText: data.selectedText,
        serializedDom: data.serializedDom,
        color: data.color || "yellow",
        noteContent: data.noteContent,
      },
    });
  }

  /**
   * Create or update markdown personal notes.
   */
  async saveNote(userId: string, articleId: string, content: string) {
    const existingNote = await this.db.note.findFirst({
      where: { userId, articleId },
    });

    if (existingNote) {
      return this.db.note.update({
        where: { id: existingNote.id },
        data: { content },
      });
    }

    return this.db.note.create({
      data: {
        userId,
        articleId,
        content,
      },
    });
  }
}
