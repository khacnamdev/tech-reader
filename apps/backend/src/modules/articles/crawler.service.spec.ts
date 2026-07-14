import { describe, it, expect } from "vitest";
import { CrawlerService } from "./crawler.service";

describe("CrawlerService", () => {
  const crawler = new CrawlerService();

  it("should extract metadata, strip header/footer noise, and compile clean Markdown", () => {
    const rawHtml = `
      <html>
        <head>
          <title>React Server Actions Guide</title>
          <meta name="author" content="Dan Abramov" />
        </head>
        <body>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
          <main>
            <article>
              <h1>React Server Actions Guide</h1>
              <p>Let's explore how server actions handle mutations.</p>
              <pre><code class="language-javascript">async function mutate() { 'use server'; }</code></pre>
            </article>
          </main>
          <footer>
            <p>© 2026 Developer Blog</p>
          </footer>
        </body>
      </html>
    `;

    const result = crawler.parseHtml(rawHtml, "https://react.dev/blog/server-actions");

    expect(result.title).toBe("React Server Actions Guide");
    expect(result.author).toBe("Dan Abramov");
    expect(result.sourceDomain).toBe("react.dev");
    
    // Check that navigation & footer noise is removed, and markdown formatting is correct
    expect(result.cleanMarkdown).not.toContain("Home");
    expect(result.cleanMarkdown).not.toContain("Developer Blog");
    expect(result.cleanMarkdown).toContain("# React Server Actions Guide");
    expect(result.cleanMarkdown).toContain("Let's explore how server actions handle mutations.");
    expect(result.cleanMarkdown).toContain("```javascript\nasync function mutate() { 'use server'; }\n```");
  });
});
