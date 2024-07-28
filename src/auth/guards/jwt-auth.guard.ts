import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: Attempting to authenticate');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    console.log('JwtAuthGuard: Handle request');
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);
    
    if (err || !user) {
      console.log('JwtAuthGuard: Authentication failed');
    } else {
      console.log('JwtAuthGuard: Authentication successful');
    }
    
    return super.handleRequest(err, user, info, context, status);
  }
}