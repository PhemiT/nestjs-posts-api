import { Controller, Post, Body, Request, UseGuards, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.username || !createUserDto.password) {
      throw new BadRequestException('Username and password are required');
    }
    return this.authService.register(createUserDto.username, createUserDto.password);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;

    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const token = await this.authService.login(username, password);
    if (!token) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
