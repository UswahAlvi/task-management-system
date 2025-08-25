import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserCompany } from '../company/entities/user-company.entity';
import { ProjectEditor } from './entities/project-editor.entity';
import { ProjectRoleEnum } from '../common/enums/projectRole.enum';
import { AddUserDto } from './dto/add-user.dto';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(ProjectEditor)
    private readonly userProjectRepository: Repository<ProjectEditor>,
  ) {}
  async getAllProjects(companyId: number) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('No such company with id ' + companyId);
    }
    const projects = await this.projectRepository.find({
      select: { id: true, name: true, description: true, createdAt: true },
      where: { companyId: company },
    });
    if (projects.length === 0) return 'No project exists in this company.';
    return projects;
  }
  async createProject(
    createProjectDto: CreateProjectDto,
    userId: number,
    companyId: number,
  ): Promise<string> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) throw new Error('no such company with id ' + companyId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('no such user with id ' + userId);
    const userCompany = await this.userCompanyRepository.findOne({
      where: { userId: user },
    });
    if (!userCompany)
      throw new Error('no such user in your company with id ' + userId);
    const project = new Project();
    project.name = createProjectDto.name;
    project.description = createProjectDto.description;
    project.companyId = company;
    project.createdBy = userCompany;
    try {
      const savedProject = await this.projectRepository.save(project);
      return `Project "${savedProject.name}" successfully created.`;
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
    await this.projectRepository.delete(projectId);
    await this.userProjectRepository.delete(projectId);
    return `Project "${projectId}" deleted successfully.`;
  }

  async getUserProjectRole(projectId: number, userId: number) {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { id: userId },
    });
    if (!userCompany) throw new Error('No such user in company with id ' + userId);
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new Error('No such project with id ' + projectId);
    try {
      const userProjects = await this.userProjectRepository.find({
        select: { role: true },
        where: { userId: userCompany, projectId: project },
      });
      return userProjects.map((up: ProjectEditor): ProjectRoleEnum => up.role);
    } catch (error) {
      throw new Error(error);
    }
  }

  async addEditorInProject(
    projectId: number,
    companyId: number,
    addUserDto: AddUserDto,
  ) {
    const { userId } = addUserDto;

    if (!(await this.existsInCompany(companyId, userId))) {
      return 'The user you are trying to add in project, does not exist in the company.';
    }
    const projectExists = await this.projectRepository.exists({
      where: { id: projectId },
    });
    if (!projectExists) {
      return 'No such project exists in the company.';
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('no user found with that id');
    }
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('no company found with that id');
    }

    if (await this.isOwner(user, company)) {
      return 'You are trying to add company owner as editor to this project, which already has editor rights to all projects.';
    }

    if (await this.isAdmin(user, company)) {
      return 'You are trying to add an admin to this project, which already has editor rights to all projects.';
    }
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new Error('No such project with id ' + projectId);

    const userCompany = await this.userCompanyRepository.findOne({
      where: { id: projectId, companyId: company },
    });
    if (!userCompany) throw new Error('No such user with id ' + userId + 'in your company');

    const alreadyAdded = await this.userProjectRepository.findOne({
      select: { id: true, role: true },
      where: { projectId: project, userId: userCompany },
    });

    if (alreadyAdded) {
      return `That user is already an editor in this project."`;
    }

    const userProject = new ProjectEditor();
    userProject.projectId = project;
    userProject.userId = userCompany;
    userProject.role = ProjectRoleEnum.editor;
    try {
      await this.userProjectRepository.save(userProject);
      return `User added successfully in project as ${userProject.role}`;
    } catch (error) {
      throw new Error(error);
    }
  }

  async removeUserFromProject(
    projectId: number,
    companyId: number,
    userId: number,
  ) {
    const projectExists = await this.projectRepository.exists({
      where: { id: projectId },
    });
    if (!projectExists) {
      return 'No such project exists in the company.';
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('no user found with that id');
    }
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('no company found with that id');
    }

    if (await this.isOwner(user, company)) {
      return 'You are trying to remove company owner from this project!';
    }

    if (await this.isAdmin(user, company)) {
      return 'You are trying to remove admin from this project.';
    }
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new Error('No such project with id ' + projectId);
    const userCompany = await this.userCompanyRepository.findOne({
      where: { id: projectId },
    });
    if (!userCompany)
      throw new Error('No such user with id ' + userId + 'in your company');

    const userProject = await this.userProjectRepository.findOne({
      where: { projectId: project, userId: userCompany },
    });

    if (!userProject) {
      return 'The user is not a part of this project.';
    }

    try {
      await this.userProjectRepository.delete(userProject.id);
      return 'User removed successfully from the project.';
    } catch (error) {
      throw new Error(error);
    }
  }

  private async existsInCompany(companyId: number, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new Error('no user found with that id');

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) throw new Error('no company found with that id');

    return await this.userCompanyRepository.exists({
      where: { userId: user, companyId: company },
    });
  }

  private async isAdmin(user: User, company: Company) {

    return await this.userCompanyRepository.exists({
      where: { companyId: company, userId: user, role: CompanyRoleEnum.Admin },
    });
  }

  private async isOwner(user: User, company: Company) {

    if (!company) throw new Error('no company found with that id');
    return await this.userCompanyRepository.exists({
      where: { companyId: company, userId: user, role: CompanyRoleEnum.Owner },
    });
  }
}
