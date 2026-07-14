import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

export interface CrawledArticle {
  title: string;
  author: string;
  sourceDomain: string;
  sourceUrl: string;
  publishedAt: Date | null;
  rawHtml: string;
  cleanMarkdown: string;
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly turndownService: TurndownService;

  constructor() {
    // Configure HTML to Markdown converter
    this.turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      hr: "---",
    });

    // Custom rule to preserve code blocks with language tags
    this.turndownService.addRule("pre", {
      filter: "pre",
      replacement: (content, node) => {
        const element = node as HTMLElement;
        const codeElement = element.querySelector("code");
        let language = "";
        
        if (codeElement) {
          const classAttr = codeElement.getAttribute("class") || "";
          const match = classAttr.match(/language-(\w+)/);
          if (match) {
            language = match[1];
          }
        }
        
        // Remove trailing lines in content to keep markdown neat
        const codeText = codeElement ? codeElement.textContent : element.textContent;
        return `\n\`\`\`${language}\n${codeText?.trim()}\n\`\`\`\n`;
      },
    });
  }

  async crawl(url: string): Promise<CrawledArticle> {
    this.logger.log(`Starting crawl request for URL: ${url}`);
    
    let html = "";
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed HTTP fetch with status code ${response.status}`);
      }
      
      html = await response.text();
    } catch (error) {
      this.logger.error(`Error fetching raw HTML from ${url}: ${(error as Error).message}`);
      throw new Error(`Failed to crawl webpage: ${(error as Error).message}`);
    }

    return this.parseHtml(html, url);
  }

  public parseHtml(html: string, url: string): CrawledArticle {
    const $ = cheerio.load(html);
    const parsedUrl = new URL(url);

    // Strip scripts, style blocks, navbars, sidebars, and ads
    $("script, style, noscript, iframe, header, footer, nav, aside, svg").remove();
    $(".ads, .advertisement, #comments, .comments, .related-posts, .share-buttons, .cookie-banner, .social-share").remove();

    // Select container by order of priority
    let contentContainer = $("article");
    if (contentContainer.length === 0) {
      contentContainer = $("[role='main']");
    }
    if (contentContainer.length === 0) {
      contentContainer = $("main");
    }
    if (contentContainer.length === 0) {
      contentContainer = $(".post-content, .article-content, .entry-content, #content");
    }
    if (contentContainer.length === 0) {
      contentContainer = $("body");
    }

    // Extract basic metadata
    const title = $("title").text().trim() || $("h1").first().text().trim() || "Untitled Article";
    
    // Author extraction strategies
    let author = "";
    const authorMeta = $("meta[name='author']").attr("content") || $("meta[property='article:author']").attr("content");
    if (authorMeta) {
      author = authorMeta;
    } else {
      author = $("[class*='author'], [id*='author']").first().text().trim().substring(0, 50) || "Unknown Author";
    }

    // Publish date extraction strategies
    let publishedAt: Date | null = null;
    const dateMeta = $("meta[property='article:published_time']").attr("content") || $("meta[name='publish-date']").attr("content");
    if (dateMeta) {
      const parsedDate = new Date(dateMeta);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate;
      }
    }

    // Get clean HTML content and convert to Markdown
    const bodyHtml = contentContainer.html() || "";
    let cleanMarkdown = "";
    if (bodyHtml) {
      cleanMarkdown = this.turndownService.turndown(bodyHtml);
    } else {
      cleanMarkdown = this.turndownService.turndown(html);
    }

    // Clean up empty lines and trailing spaces in markdown
    cleanMarkdown = cleanMarkdown
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return {
      title,
      author: author || "Unknown",
      sourceDomain: parsedUrl.hostname,
      sourceUrl: url,
      publishedAt,
      rawHtml: html,
      cleanMarkdown,
    };
  }
}
