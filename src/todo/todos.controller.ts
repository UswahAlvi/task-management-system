import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CompanyRoles } from '../common/decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';

@CompanyRoles(CompanyRoleEnum.Owner, CompanyRoleEnum.Admin)
@Controller('company/:companyId/project/:projectId/tasklist/:tasklistId/todo')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}
  @CompanyRoles(
    CompanyRoleEnum.Owner,
    CompanyRoleEnum.Admin,
    CompanyRoleEnum.Viewer,
  )
  @Get()
  getAllTodos(@Param('tasklistId', ParseIntPipe) tasklistId: number) {
    return this.todosService.getAllTodosInTasklist(tasklistId);
  }
  @CompanyRoles(
    CompanyRoleEnum.Owner,
    CompanyRoleEnum.Admin,
    CompanyRoleEnum.Viewer,
  )
  @Get(':todoId')
  getTodo(@Param('todoId', ParseIntPipe) todoId: number) {
    return this.todosService.getTodoById(todoId);
  }

  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Param('tasklistId', ParseIntPipe) tasklistId: number,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.todosService.createTodo(tasklistId, companyId, createTodoDto);
  }

  @Delete(':todoId')
  delete(@Param('todoId', ParseIntPipe) todoId: number) {
    return this.todosService.deleteTodo(todoId);
  }

  @Patch(':todoId')
  update(
    @Body() updateTodoDto: UpdateTodoDto,
    @Param('todoId', ParseIntPipe) todoId: number,
    @Param('tasklistId', ParseIntPipe) tasklistId: number,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.todosService.updateTodo(
      todoId,
      tasklistId,
      companyId,
      updateTodoDto,
    );
  }
}
