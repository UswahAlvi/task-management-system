import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CompanyRoles } from '../common/decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import { TaskListsService } from './tasklists.service';
import { ProjectRoles } from '../common/decorators/projectRoles.decorator';
import { ProjectRoleEnum } from '../common/enums/projectRole.enum';

@CompanyRoles(CompanyRoleEnum.Owner, CompanyRoleEnum.Admin)
@Controller('company/:companyId/project/:projectId/tasklist')
export class TasklistsController {
  constructor(private readonly tasklistService: TaskListsService) {}

  @CompanyRoles(
    CompanyRoleEnum.Owner,
    CompanyRoleEnum.Admin,
    CompanyRoleEnum.Viewer,
  )
  @Get()
  getAllTasklists(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.tasklistService.getAllTasklists(projectId);
  }

  @Get(':tasklistId')
  getTasklist(@Param('tasklistId', ParseIntPipe) tasklistId: number) {
    return this.tasklistService.getTasklist(tasklistId);
  }

  @ProjectRoles(ProjectRoleEnum.editor)
  @Post()
  createTaskList(
    @Body() { name }: { name: string },
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.tasklistService.createTasklist(name, projectId);
  }

  @ProjectRoles(ProjectRoleEnum.editor)
  @Patch(':tasklistId')
  updateTaskList(
    @Body() { name }: { name: string },
    @Param('tasklistId', ParseIntPipe) tasklistId: number,
  ) {
    return this.tasklistService.updateTasklist(tasklistId, name);
  }

  @ProjectRoles(ProjectRoleEnum.editor)
  @Delete(':tasklistId')
  deleteTaskList(@Param('tasklistId', ParseIntPipe) tasklistId: number) {
    return this.tasklistService.deleteTasklist(tasklistId);
  }
}
