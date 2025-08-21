import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyInviteDto } from './dto/create-company-invite.dto';
import { CompanyRoles } from '../common/decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import * as authenticatedRequestInterface from '../common/interfaces/authenticated-request.interface';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyInvite } from './entities/company-invite.entity';

@Controller('company')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  getMyCompanies(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.companiesService.viewMyCompanies(userId);
  }

  @Post()
  create(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    const userId = req.user.sub;
    return this.companiesService.create(userId, createCompanyDto.companyName);
  }

  @Get(':companyId')
  getCompany(@Param('companyId') companyId: string) {
    const id = parseInt(companyId);
    return this.companiesService.getCompanyById(id);
  }

  @CompanyRoles(CompanyRoleEnum.Admin, CompanyRoleEnum.Owner)
  @Post(':companyId/send-invite')
  invite(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
    @Body() createCompanyInviteDto: CreateCompanyInviteDto,
  ) {
    const userId = req.user.sub;
    const companyId = parseInt(req.params.companyId);
    return this.companiesService.sendInvite(
      userId,
      companyId,
      createCompanyInviteDto,
    );
  }

  @CompanyRoles(CompanyRoleEnum.Admin, CompanyRoleEnum.Owner)
  @Get(':companyId/invites-by-me')
  findAllInvitesByUserInCompany(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ): Promise<CompanyInvite[]> {
    const userId = req.user.sub;
    const companyId = parseInt(req.params.companyId);
    return this.companiesService.getInvitesByCompanyIdAndUserId(
      userId,
      companyId,
    );
  }

  @CompanyRoles(CompanyRoleEnum.Admin, CompanyRoleEnum.Owner)
  @Get(':companyId/users')
  getAllUsersInCompany(@Param('companyId') companyId: string) {
    const id = parseInt(companyId);
    return this.companiesService.getUsersByCompanyId(id);
  }

  @CompanyRoles(CompanyRoleEnum.Admin, CompanyRoleEnum.Owner)
  @Delete(':companyId/:userId')
  removeUserFromCompany(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const companyId = parseInt(req.params.companyId);
    const usersId = parseInt(req.params.userId);
    return this.companiesService.removeUserFromCompany(companyId, usersId);
  }
}
