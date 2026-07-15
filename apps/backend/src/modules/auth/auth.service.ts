import { Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly db: DatabaseService) {}

  async loginOrCreate(email: string, name?: string) {
    const trimmedEmail = email.trim().toLowerCase();

    let user = await this.db.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      this.logger.log(`Registering new user: ${trimmedEmail}`);
      user = await this.db.user.create({
        data: {
          email: trimmedEmail,
          name: name || "Developer",
          preferences: {
            create: {
              targetLanguage: "VI",
              theme: "DARK",
              fontSize: 16,
            },
          },
          statistics: {
            create: {
              articlesRead: 0,
              totalReadingTime: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
          },
        },
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not configured.");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRATION || "24h") as jwt.SignOptions["expiresIn"],
    });

    return { token, user };
  }
}
