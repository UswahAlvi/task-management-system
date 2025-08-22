import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosController } from './todos.controller';
import { TaskList } from '../tasklist/entities/tasklist.entity';
import { Todo } from './entities/todo.entity';
import { UserCompany } from '../company/entities/user-company.entity';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { TodosService } from './todos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo, TaskList, Company, UserCompany, User]),
  ],
  providers: [TodosService],
  controllers: [TodosController],
})
export class TodosModule {}
