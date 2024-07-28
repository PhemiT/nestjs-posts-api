import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { Comment } from './schemas/comment.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const createdPost = new this.postModel({ ...createPostDto, createdBy: userId });
    return createdPost.save();
  }

  async findAll(sortBy: string = 'createdAt', order: 'asc' | 'desc' = 'desc'): Promise<Post[]> {
    const sortOptions: { [key: string]: 1 | -1 } = {
      [sortBy]: order === 'asc' ? 1 : -1,
    };
    return this.postModel.find().sort(sortOptions).exec();
  }

  async filterByCategory(category: string): Promise<Post[]> {
    return this.postModel.find({ category }).exec();
  }

  async findById(id: string): Promise<Post | null> {
    return this.postModel.findById(id).exec();
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (post.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not allowed to edit this post');
    }
    return this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();
  }

  async delete(id: string, userId: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }
    
    return this.postModel.findByIdAndDelete(id).exec();
  }

  async upvotePost(id: string): Promise<Post> {
    return this.postModel.findByIdAndUpdate(id, { $inc: { upvotes: 1 } }, { new: true }).exec();
  }

  async downvotePost(id: string): Promise<Post> {
    return this.postModel.findByIdAndUpdate(id, { $inc: { downvotes: 1 } }, { new: true }).exec();
  }

  async incrementViewCount(id: string): Promise<Post> {
    return this.postModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true }).exec();
  }

  async createComment(createCommentDto: CreateCommentDto & { createdBy: string }): Promise<Comment> {
    const createdComment = new this.commentModel(createCommentDto);
    await createdComment.save();
    await this.postModel.findByIdAndUpdate(createCommentDto.postId, { $inc: { replyCount: 1 } }).exec();
    return createdComment;
  }

  async findCommentsByPost(postId: string): Promise<Comment[]> {
    return this.commentModel.find({ postId }).exec();
  }
}
