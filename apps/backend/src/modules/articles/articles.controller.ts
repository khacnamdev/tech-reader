import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { GetUser } from "../../common/decorators/get-user.decorator";

class IngestDto {
  url: string;
}

class ProgressDto {
  scrollPercentage: number;
}

class HighlightDto {
  selectedText: string;
  serializedDom?: string;
  color?: string;
  noteContent?: string;
}

class NoteDto {
  content: string;
}

@Controller("articles")
@UseGuards(AuthGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post("ingest")
  @HttpCode(HttpStatus.OK)
  async ingest(@GetUser("id") userId: string, @Body() body: IngestDto) {
    return this.articlesService.ingestFromUrl(userId, body.url);
  }

  @Get()
  async findAll(
    @GetUser("id") userId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("folderId") folderId?: string,
    @Query("search") search?: string
  ) {
    return this.articlesService.findAll(userId, { page, limit, folderId, search });
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @GetUser("id") userId: string) {
    return this.articlesService.findOne(id, userId);
  }

  @Delete(":id")
  async delete(@Param("id") id: string, @GetUser("id") userId: string) {
    return this.articlesService.delete(id, userId);
  }

  @Put(":id/progress")
  async updateProgress(
    @Param("id") id: string,
    @GetUser("id") userId: string,
    @Body() body: ProgressDto
  ) {
    return this.articlesService.updateProgress(id, userId, body.scrollPercentage);
  }

  @Post(":id/highlights")
  async addHighlight(
    @Param("id") id: string,
    @GetUser("id") userId: string,
    @Body() body: HighlightDto
  ) {
    return this.articlesService.saveHighlight(userId, id, body);
  }

  @Post(":id/notes")
  async saveNote(
    @Param("id") id: string,
    @GetUser("id") userId: string,
    @Body() body: NoteDto
  ) {
    return this.articlesService.saveNote(userId, id, body.content);
  }
}
