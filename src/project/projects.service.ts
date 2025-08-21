import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}
  async getAllProjects(): Promise<Project[]> {
    return await this.projectRepository.find();
  }
  async createProject(
    createProjectDto: CreateProjectDto,
    userId: number,
    companyId: number,
  ): Promise<string> {
    const project = new Project();
    project.name = createProjectDto.name;
    project.description = createProjectDto.description;
    project.companyId = companyId;
    project.createdBy = userId;
    try {
      const savedProject = await this.projectRepository.save(project);
      return `Project ${savedProject.name} successfully created`;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
