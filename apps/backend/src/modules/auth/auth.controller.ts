import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

class LoginDto {
  email: string;
  name?: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.authService.loginOrCreate(body.email, body.name);
  }
}
