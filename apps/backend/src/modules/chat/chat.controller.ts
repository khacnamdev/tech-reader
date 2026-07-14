import { Controller, Get, Post, Body, Param, Res, UseGuards } from "@nestjs/common";
import * as express from "express";
import { ChatService } from "./chat.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { GetUser } from "../../common/decorators/get-user.decorator";

class CreateSessionDto {
  title?: string;
}

class SendMessageDto {
  message: string;
  articleId?: string;
}

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("sessions")
  async createSession(@GetUser("id") userId: string, @Body() body: CreateSessionDto) {
    return this.chatService.createSession(userId, body.title);
  }

  @Get("sessions")
  async getSessions(@GetUser("id") userId: string) {
    return this.chatService.getSessions(userId);
  }

  @Get("sessions/:id/messages")
  async getMessages(@Param("id") id: string, @GetUser("id") userId: string) {
    return this.chatService.getMessages(id, userId);
  }

  /**
   * Streams responses token-by-token using standard chunked transfer encoding (EventStream style).
   */
  @Post("sessions/:id/stream")
  async streamResponse(
    @Param("id") id: string,
    @GetUser("id") userId: string,
    @Body() body: SendMessageDto,
    @Res() res: express.Response
  ) {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Prevents proxy servers (like Nginx) from caching stream chunks

    try {
      await this.chatService.streamResponse(
        id,
        userId,
        body.message,
        body.articleId,
        (token) => {
          // Format token chunk for SSE protocol
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        },
        () => {
          res.write(`data: [DONE]\n\n`);
          res.end();
        }
      );
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`);
      res.end();
    }
  }
}
