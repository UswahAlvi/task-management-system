import { CompanyRoleEnum } from '../enums/companyRole.enum';
import { SetMetadata } from '@nestjs/common';
export const COMPANY_ROLES_KEY = 'roles';

export const CompanyRoles = (...roles: CompanyRoleEnum[]) =>
  SetMetadata(COMPANY_ROLES_KEY, roles);
