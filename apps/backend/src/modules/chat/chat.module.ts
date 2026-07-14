import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { DatabaseModule } from "../../database/database.module";
import { ArticlesModule } from "../articles/articles.module";

@Module({
  imports: [DatabaseModule, ArticlesModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
