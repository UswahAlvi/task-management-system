import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskList } from './entities/tasklist.entity';
import { Repository } from 'typeorm';
import { CompanyRoles } from '../common/decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import { Project } from '../project/entities/project.entity';

@CompanyRoles(
  CompanyRoleEnum.Owner,
  CompanyRoleEnum.Admin,
  CompanyRoleEnum.Viewer,
)
@Injectable()
export class TaskListsService {
  constructor(
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getAllTasklists(projectId: number) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`No project with id ${projectId}`);
    }
    const taskLists = await this.taskListRepository.find({
      where: { project },
    });
    if (!taskLists || !taskLists.length)
      return `No tasklists found in project ${projectId}.`;
    return taskLists;
  }

  async getTasklist(id: number) {
    const tasklist = await this.taskListRepository.findOne({ where: { id } });
    if (!tasklist)
      throw new NotFoundException(`Task list with id ${id} not found`);
    return tasklist;
  }
  async createTasklist(name: string, projectId: number) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project)
      throw new Error('No such project in your company with id ' + projectId);
    const tasklist = new TaskList();
    tasklist.name = name;
    tasklist.project = project;
    await this.taskListRepository.save(tasklist);
    return `Tasklist "${name}" created successfully.`;
  }

  async deleteTasklist(id: number) {
    const result = await this.taskListRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tasklist with id ${id} not found`);
    }
    return `Tasklist ${id} deleted successfully.`;
  }

  async updateTasklist(id: number, name: string) {
    const tasklist = await this.taskListRepository.findOne({ where: { id } });
    if (!tasklist) {
      throw new NotFoundException(`Tasklist with id ${id} not found`);
    }

    tasklist.name = name;
    await this.taskListRepository.save(tasklist);
    return `Tasklist ${id} updated successfully. New name: ${name}`;
  }

}
