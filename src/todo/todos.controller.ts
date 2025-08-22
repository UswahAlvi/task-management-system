import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe, Patch,
  Post,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('company/:companyId/project/:projectId/tasklist/:tasklistId/todo')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}
  @Get()
  getAllTodos(@Param('tasklistId', ParseIntPipe) tasklistId: number) {
    return this.todosService.getAllTodosInTasklist(tasklistId);
  }
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
}
