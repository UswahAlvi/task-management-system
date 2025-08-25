import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CompanyRoles } from '../common/decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import * as authenticatedRequestInterface from '../common/interfaces/authenticated-request.interface';
import { UpdateCommentDto } from './dto/update-comment.dto';

@CompanyRoles(
  CompanyRoleEnum.Owner,
  CompanyRoleEnum.Admin,
)
@Controller(
  'company/:companyId/project/:projectId/tasklist/:tasklistId/todo/:todoId/comment',
)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @CompanyRoles(
    CompanyRoleEnum.Admin,
    CompanyRoleEnum.Owner,
    CompanyRoleEnum.Viewer,
  )
  @Get()
  getAll(@Param('todoId', ParseIntPipe) todoId: number) {
    return this.commentService.findAll(todoId);
  }

  @Post()
  comment(
    @Param('todoId', ParseIntPipe) todoId: number,
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.sub;
    return this.commentService.createComment(userId, todoId, createCommentDto);
  }

  @Patch(':commentId')
  updateComment(
    @Body() updateCommentDto: UpdateCommentDto,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentService.updateComment(commentId, updateCommentDto);
  }

  @Delete(':commentId')
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.deleteComment(commentId);
  }
}
