import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CompanyRoles } from '../common/decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import * as authenticatedRequestInterface from '../common/interfaces/authenticated-request.interface';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddUserDto } from './dto/add-user.dto';

@CompanyRoles(CompanyRoleEnum.Owner, CompanyRoleEnum.Admin)
@Controller('company/:companyId/project')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Get()
  getAllProjects(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.projectService.getAllProjects(companyId);
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

  @Get(':projectId')
  getProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectById(projectId);
  }

  @Patch(':projectId')
  updateProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.updateProjectById(projectId, updateProjectDto);
  }

  @Delete(':projectId')
  deleteProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectService.deleteProject(projectId);
  }

  @Post(':projectId/add-editor')
  addEditorInProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() addUserDto: AddUserDto,
  ) {
    return this.projectService.addEditorInProject(
      projectId,
      companyId,
      addUserDto,
    );
  }

  @Delete(':projectId/remove-user')
  removeUser(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() { userId }: { userId: number },
  ) {
    return this.projectService.removeUserFromProject(
      projectId,
      companyId,
      userId,
    );
  }
}
