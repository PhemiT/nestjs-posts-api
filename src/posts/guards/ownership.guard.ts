import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PostsService } from '../posts.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private postsService: PostsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = request.params.id;

    if (!user || !postId) {
      throw new ForbiddenException('User or post not found');
    }

    const post = await this.postsService.findById(postId);
    if (post.createdBy.toString() !== user._id.toString()) {
      throw new ForbiddenException('You are not authorized to modify this post');
    }

    return true;
  }
}
