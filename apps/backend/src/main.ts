import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend web client requests
  app.enableCors({
    origin: "*", // In production, replace with specific origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Set the global prefix for api routing
  app.setGlobalPrefix("api/v1");

  const port = process.env.BACKEND_PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`NestJS application successfully started and listening on port ${port}`);
}
bootstrap();
