import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ArticlesModule } from "./modules/articles/articles.module";
import { ChatModule } from "./modules/chat/chat.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [
    DatabaseModule,
    ArticlesModule,
    ChatModule,
    AuthModule,
  ],
})
export class AppModule {}
