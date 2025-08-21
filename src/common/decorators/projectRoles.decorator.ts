import { SetMetadata } from '@nestjs/common';
import { ProjectRoleEnum } from '../enums/projectRole.enum';

export const PROJECT_ROLES_KEY = 'projectRoles';
export const ProjectRoles = (...roles: ProjectRoleEnum[]) =>
  SetMetadata(PROJECT_ROLES_KEY, roles);
