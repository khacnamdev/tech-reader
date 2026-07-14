import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";
import { CrawlerService } from "./crawler.service";
import { AIEnrichedService } from "./ai-enrichment.service";
import { VectorService } from "./vector.service";
import { DatabaseModule } from "../../database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    CrawlerService,
    AIEnrichedService,
    VectorService,
  ],
  exports: [VectorService],
})
export class ArticlesModule {}
