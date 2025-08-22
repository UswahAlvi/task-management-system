import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COMPANY_ROLES_KEY } from '../decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../enums/companyRole.enum';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { CompaniesService } from '../../company/companies.service';

@Injectable()
export class CompanyRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private companiesService: CompaniesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<CompanyRoleEnum[]>(
      COMPANY_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles || roles.length === 0) {
      return true;
    }

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const companyId = parseInt(request.params.companyId);
    if (!companyId) {
      throw new UnauthorizedException(
        'Company role guard disapproved of your request as invalid or no companyId provided in parameter',
      );
    }
    const userId = request.user.sub;

    const rolesInCompany =
      await this.companiesService.getRolesByCompanyIdAndUserId(
        userId,
        companyId,
      );

    const flag = roles.some((role: CompanyRoleEnum): boolean => {
      return rolesInCompany.includes(role);
    });
    if (!flag) {
      throw new UnauthorizedException(
        `You are not eligible for this request. Roles in company required for this request: ${roles.join(', ')}`,
      );
    }
    return true;
  }
}
