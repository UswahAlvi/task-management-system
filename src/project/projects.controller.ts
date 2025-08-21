import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Roles } from '../Guards/roles.decorator';
import { CompanyRoleEnum } from '../Guards/companyRole.enum';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import * as authenticatedRequestInterface from '../companies/interfaces/authenticated-request.interface';

@Roles(CompanyRoleEnum.Owner, CompanyRoleEnum.Admin)
@Controller(':companyId/projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}
  @Get()
  getAllProjects() {
    return this.projectService.getAllProjects();
  }
  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const companyId = parseInt(req.params.companyId);
    return this.projectService.createProject(
      createProjectDto,
      userId,
      companyId,
    );
  }
}
