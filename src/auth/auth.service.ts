import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<any> {
    this.logger.log(`Validating user with payload: ${JSON.stringify(payload)}`);
    const user = await this.usersService.findOneById(payload.sub);
    if (user) {
      this.logger.log(`User found: ${JSON.stringify(user)}`);
    } else {
      this.logger.warn(`User not found for payload: ${JSON.stringify(payload)}`);
    }
    return user;
  }

  async login(username: string, password: string) {
    this.logger.log(`Attempting login for user: ${username}`);
    const user = await this.usersService.validateUser(username, password);
    if (user) {
      const payload: JwtPayload = { sub: user._id.toString(), username: user.username };
      this.logger.log(`Login successful for user: ${username}`);
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    this.logger.warn(`Login failed for user: ${username}`);
    return null;
  }

  async register(username: string, password: string) {
    return this.usersService.create(username, password);
  }
}
