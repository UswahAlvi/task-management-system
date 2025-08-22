import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskList } from '../tasklist/entities/tasklist.entity';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { UserCompany } from '../company/entities/user-company.entity';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @InjectRepository(TaskList)
    private readonly tasklistRepository: Repository<TaskList>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  async getAllTodosInTasklist(tasklistId: number) {
    const tasklist = await this.tasklistRepository.findOne({
      where: { id: tasklistId },
    });
    if (!tasklist) throw new NotFoundException('No tasklist with id ' + tasklistId);

    const Todos = await this.todoRepository.find({ where: { tasklist } });
    if (!Todos || !Todos.length)
      throw new NotFoundException('No todos in tasklist with id ' + tasklistId);
    return Todos;
  }

  async getTodoById(id: number) {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) throw new NotFoundException('No todo exists with id ' + id);
    return todo;
  }

  async createTodo(
    tasklistId: number,
    companyId: number,
    createTodoDto: CreateTodoDto,
  ) {
    const taskList = await this.tasklistRepository.findOne({
      where: { id: tasklistId },
    });
    if (!taskList)
      throw new NotFoundException('No tasklist with id ' + tasklistId);
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('No company with id ' + companyId);
    }
    const user = await this.userRepository.findOne({
      where: { id: createTodoDto.assignedTo },
    });
    if (!user)
      throw new NotFoundException(
        'No user with id ' + createTodoDto.assignedTo,
      );
    const userCompany = await this.userCompanyRepository.findOne({
      where: { companyId: company, userId: user },
    });
    if (!userCompany) {
      throw new NotFoundException(
        'No user with id ' + userCompany + ' in your company',
      );
    }
    const todo = new Todo();
    todo.title = createTodoDto.title;
    todo.description = createTodoDto.description;
    todo.dueDate = createTodoDto.dueDate;
    todo.status = createTodoDto.status;
    todo.tasklist = taskList;
    todo.priority = createTodoDto.priority;

    await this.todoRepository.save(todo);
    return `Todo "${todo.title}" created successfully.`;
  }
}
