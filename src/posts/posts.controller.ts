import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from './guards/ownership.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    const userId = req.user._id; 
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  async findAll(
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return this.postsService.findAll(sortBy, order);
  }

  @Get('/category/:category')
  async filterByCategory(@Param('category') category: string) {
    return this.postsService.filterByCategory(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.postsService.incrementViewCount(id);
    return this.postsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Request() req) {
    const userId = req.user._id;
    return this.postsService.update(id, updatePostDto, userId);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user._id;
    return this.postsService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/upvote')
  async upvote(@Param('id') id: string) {
    return this.postsService.upvotePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/downvote')
  async downvote(@Param('id') id: string) {
    return this.postsService.downvotePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createComment(
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req
  ) {
    const userId = req.user._id;
    return this.postsService.createComment({
      ...createCommentDto,
      postId,
      createdBy: userId
    });
  }

  @Get(':id/comments')
  async findComments(@Param('id') postId: string) {
    return this.postsService.findCommentsByPost(postId);
  }
}
