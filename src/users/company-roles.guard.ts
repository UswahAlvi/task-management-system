import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';
import { AuthenticatedRequest } from '../Companies/interfaces/authenticated-request.interface';
import { CompaniesService } from '../Companies/companies.service';
import { UserCompany } from '../Companies/entities/user-company.entity';

@Injectable()
export class CompanyRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private companiesService: CompaniesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const companyId = parseInt(request.params.companyId);
    const userId = request.user.sub;

    const rolesInCompany =
      await this.companiesService.getRolesByCompanyIdAndUserId(
        userId,
        companyId,
      );

    console.log('Roles required:', roles);
    console.log('User roles in company:', rolesInCompany);

    return roles.some((role: Role): boolean => {
      return rolesInCompany.some(
        (userCompany: UserCompany): boolean => userCompany.role === role,
      );
    });
  }
}
