import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserCompany } from '../companies/entities/user-company.entity';
import { UserProject } from './entities/user-project.entity';
import { ProjectRoleEnum } from '../common/enums/projectRole.enum';
import { AddUserDto } from './dto/add-user.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(UserProject)
    private readonly userProjectRepository: Repository<UserProject>,
  ) {}
  async getAllProjects(companyId: number) {
    const projects = await this.projectRepository.find({
      select: { id: true, name: true, description: true, createdAt: true },
      where: { companyId },
    });
    if (projects.length === 0) return 'No project exists in this company.';
    return projects;
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
      const userProject = new UserProject();
      userProject.userId = userId;
      userProject.projectId = savedProject.id;
      userProject.role = ProjectRoleEnum.editor;
      await this.userProjectRepository.save(userProject);
      return `Project "${savedProject.name}" successfully created`;
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async getProjectById(id: number) {
    try {
      const project = await this.projectRepository.findOne({
        select: { id: true, name: true, description: true, createdAt: true },
        where: { id },
      });
      if (!project) return 'no such project exists in this company.';
      return project;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateProjectById(
    projectId: number,
    updateProjectDto: UpdateProjectDto,
  ) {
    try {
      const updatedAt = new Date();
      const { name, description } = updateProjectDto;
      await this.projectRepository.update(projectId, {
        name,
        description,
        updatedAt,
      });
      return `Project "${projectId}" successfully updated`;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteProject(projectId: number) {
    try {
      await this.projectRepository.delete(projectId);
      await this.userProjectRepository.delete(projectId);
      return `Project "${projectId}" deleted successfully.`;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserProjectRole(projectId: number, userId: number) {
    try {
      const userProjects = await this.userProjectRepository.find({
        select: { role: true },
        where: { userId, projectId },
      });
      return userProjects.map((up: UserProject): ProjectRoleEnum => up.role);
    } catch (error) {
      throw new Error(error);
    }
  }

  async addUserInProject(projectId: number, addUserDto: AddUserDto) {
    const projectExists = await this.projectRepository.exists({
      where: { id: projectId },
    });
    if (!projectExists) {
      return 'No such project exists in the company.';
    }
    if (
      addUserDto.role !== ProjectRoleEnum.editor &&
      addUserDto.role !== ProjectRoleEnum.viewer
    ) {
      return 'The role can either be viewer or editor. Please provide a valid role.';
    }
    const userProject = new UserProject();
    userProject.projectId = projectId;
    userProject.userId = addUserDto.userId;
    userProject.role = addUserDto.role;
    try {
      await this.userProjectRepository.save(userProject);
      return `User added successfully in project as ${userProject.role}`;
    } catch (error) {
      throw new Error(error);
    }
  }
}
