import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompaniesService } from './companies.service';
import * as authenticatedRequestInterface from './interfaces/authenticated-request.interface';
import * as authenticatedRequestInterface_1 from './interfaces/authenticated-request.interface';
import { CreateCompanyInviteDto } from './dto/create-company-invite.dto';
import { Roles } from '../users/roles.decorator';
import { Role } from '../users/role.enum';
import { CompanyInvite } from './entities/company-invite.entity';

@Controller('company')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('create')
  create(
    @Req() req: authenticatedRequestInterface_1.AuthenticatedRequest,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    const userId = req.user.sub;
    return this.companiesService.create(userId, createCompanyDto.companyName);
  }

  @Roles(Role.Admin, Role.Owner)
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

  @Roles(Role.Admin, Role.Owner)
  @Get(':companyId/invites-by-me')
  findAllInvitesByUserInCompany(
    @Req() req: authenticatedRequestInterface_1.AuthenticatedRequest,
  ): Promise<CompanyInvite[]> {
    const userId = req.user.sub;
    const companyId = parseInt(req.params.companyId);
    return this.companiesService.getInvitesByCompanyIdAndUserId(
      userId,
      companyId,
    );
  }

  @Get('my-companies')
  viewMyCompanies(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.companiesService.viewMyCompanies(userId);
  }
}
