import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROJECT_ROLES_KEY } from '../decorators/projectRoles.decorator';
import { ProjectRoleEnum } from '../enums/projectRole.enum';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { ProjectsService } from '../../project/projects.service';
import { CompaniesService } from '../../companies/companies.service';

@Injectable()
export class ProjectRolesGuard implements CanActivate {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly companiesService: CompaniesService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRoleEnum[]>(
      PROJECT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const projectId = parseInt(request.params.projectId);
    const companyId = parseInt(request.params.companyId);
    if (!projectId)
      throw new UnauthorizedException(
        'Project role guard disapproved of your request as invalid or no projectId provided in parameter',
      );
    const userId = request.user.sub;
    if (
      (await this.companiesService.isAdmin(userId, companyId)) ||
      (await this.companiesService.isOwner(userId, companyId))
    ) {
      return true;
    }
    const rolesInProject = await this.projectsService.getUserProjectRole(
      projectId,
      userId,
    );
    const flag = requiredRoles.some((role) => rolesInProject.includes(role));
    if (!flag) {
      throw new UnauthorizedException(
        `You are not eligible for this request. Roles in project required for this request: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}
