import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../user/entities/user.entity';
import { UserCompany } from '../company/entities/user-company.entity';
import { Todo } from '../todo/entities/todo.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>
  ) {}

  async findAll(todoId: number): Promise<Comment[]> {
    const todo = await this.todoRepository.findOne({ where: { id: todoId } });
    if (!todo) {
      throw new NotFoundException('no such todo with id ' + todoId);
    }
    return this.commentRepository.find({ where: { todo } });
  }

  async createComment(
    userId: number,
    todoId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const todo = await this.todoRepository.findOne({ where: { id: todoId } });
    if (!todo) throw new NotFoundException('todo not found');
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return 'no user found';
    }
    const userCompany = await this.userCompanyRepository.findOne({
      where: { userId: user },
    });
    if (!userCompany) {
      return 'user does not exist in company';
    }

    const comment = new Comment();
    comment.text = createCommentDto.text;
    comment.commentedAt = new Date();
    comment.author = userCompany;
    comment.todo = todo;
    await this.commentRepository.save(comment);
    return 'commented successfully';
  }
  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto){
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('comment not found');

    await this.commentRepository.update(commentId, {
      ...comment,
      ...updateCommentDto,
      editedAt: new Date(),
    });
    return 'comment edited successfully';
  }
  async deleteComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('comment not found');
    const result = await this.commentRepository.delete(commentId);
    if (result.affected === 0) {
      throw new NotFoundException('not deleted');
    } else return 'comment deleted successfully';
  }
}
