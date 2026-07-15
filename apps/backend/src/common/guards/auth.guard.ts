import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { DatabaseService } from "../../database/database.service";

interface DecodedToken {
  sub: string; // user id
  email?: string;
  name?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authorization token missing");
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not configured.");
    }

    try {
      // Decode JWT token
      const decoded = jwt.verify(token, secret) as DecodedToken;

      // Extract user id and email
      const userId = decoded.sub;
      if (!userId) {
        throw new UnauthorizedException("User ID (sub) is missing in the token");
      }

      const email = decoded.email;
      if (!email) {
        throw new UnauthorizedException("Email is missing in the token");
      }

      const name = decoded.name || "User";

      // Automatically upsert user profile and preferences in local DB on first request
      let user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        user = await this.db.user.create({
          data: {
            id: userId,
            email,
            name,
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

      // Attach user to request context for subsequent use in controllers/services
      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired authorization token");
    }
  }
}
