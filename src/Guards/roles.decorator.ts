import { CompanyRoleEnum } from './companyRole.enum';
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';

export const Roles = (...roles: CompanyRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
