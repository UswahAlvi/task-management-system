import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskList } from './entities/tasklist.entity';
import { TasklistsController } from './tasklists.controller';
import { TaskListsService } from './tasklists.service';
import { Project } from '../project/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskList, Project])],
  controllers: [TasklistsController],
  providers: [TaskListsService],
})
export class TasklistsModule {}
