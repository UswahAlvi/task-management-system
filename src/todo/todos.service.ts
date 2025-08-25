import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskList } from '../tasklist/entities/tasklist.entity';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { UserCompany } from '../company/entities/user-company.entity';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @InjectRepository(TaskList)
    private readonly tasklistRepository: Repository<TaskList>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  async getAllTodosInTasklist(tasklistId: number) {
    const todo = await this.todoRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.assignedTo', 'userCompany')
      .leftJoinAndSelect('userCompany.userId', 'user')
      .leftJoinAndSelect('todo.tasklist', 'tasklist')
      .where('todo.tasklist.id = :id', { id: tasklistId })
      .getMany();

    if (!todo)
      throw new NotFoundException(
        'No todo exists within tasklist id ' + tasklistId,
      );

    return todo.map((todo) => {
      return {
        ...todo,
        assignedTo: todo.assignedTo?.userId?.username,
        tasklist: todo.tasklist.name,
      };
    });
  }

  async getTodoById(id: number) {
    const todo = await this.todoRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.assignedTo', 'userCompany')
      .leftJoinAndSelect('userCompany.userId', 'user')
      .leftJoinAndSelect('todo.tasklist', 'tasklist')
      .where('todo.id = :id', { id })
      .getOne();

    if (!todo) throw new NotFoundException('No todo exists with id ' + id);



    return {
      ...todo,
      assignedTo: todo.assignedTo?.userId?.username ?? null,
      tasklist: todo.tasklist.name,
    };
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
        'No user with id ' + createTodoDto.assignedTo + ' in your company',
      );
    }
    const todo = new Todo();
    todo.title = createTodoDto.title;
    todo.description = createTodoDto.description;
    todo.dueDate = createTodoDto.dueDate;
    todo.status = createTodoDto.status;
    todo.tasklist = taskList;
    todo.priority = createTodoDto.priority;
    todo.assignedTo = userCompany;

    await this.todoRepository.save(todo);
    return `Todo "${todo.title}" created successfully.`;
  }
  async deleteTodo(id: number) {
    const tasklist = await this.todoRepository.delete(id);
    if (tasklist.affected === 0) {
      throw new NotFoundException('No tasklist with id ' + id);
    }
    return 'todo deleted successfully.';
  }

  async updateTodo(
    id: number,
    tasklistId: number,
    companyId: number,
    updateTodoDto: UpdateTodoDto,
  ) {
    const tasklist = await this.tasklistRepository.findOne({
      where: { id: tasklistId },
    });
    if (!tasklist) return 'no tasklist with id ' + tasklistId;

    const todo = await this.todoRepository.findOne({ where: { id, tasklist } });

    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    let userCompany: UserCompany | null = null;
    if (updateTodoDto?.assignedTo) {
      const [user, company] = await Promise.all([
        this.userRepository.findOne({
          where: { id: updateTodoDto.assignedTo },
        }),
        this.companyRepository.findOne({ where: { id: companyId } }),
      ]);
      if (!user) {
        return 'no user with id ' + updateTodoDto.assignedTo;
      }
      if (!company) {
        return 'no company with id ' + companyId;
      }
      userCompany = await this.userCompanyRepository.findOne({
        where: { userId: user, companyId: company },
      });
      if (!userCompany) {
        return 'no user with id ' + userCompany + ' in your company';
      }
    }

    const result = await this.todoRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('No todo with id ' + id);
    }
    await this.todoRepository.update(id, {
      ...result,
      ...updateTodoDto,
      assignedTo: userCompany ? userCompany : result.assignedTo,
    });
    return 'updated successfully.';
  }
}
