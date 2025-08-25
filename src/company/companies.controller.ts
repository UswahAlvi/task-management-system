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
import { CompaniesService } from './companies.service';
import { CreateCompanyInviteDto } from './dto/create-company-invite.dto';
import { CompanyRoles } from '../common/decorators/companyRoles.decorator';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import * as authenticatedRequestInterface from '../common/interfaces/authenticated-request.interface';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyInvite } from './entities/company-invite.entity';
import { Public } from '../common/decorators/public.decorator';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { IntegerType } from 'typeorm';

@Controller('company')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Public()
  @Get('all')
  getAllCompanies() {
    return this.companiesService.getAllCompanies();
  }

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
  @CompanyRoles(CompanyRoleEnum.Owner, CompanyRoleEnum.Admin)
  @Patch(':companyId')
  update(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Param('companyId', ParseIntPipe) companyId,
  ) {
    return this.companiesService.updateCompany(companyId, updateCompanyDto);
  }

  @Get(':companyId')
  getCompany(@Param('companyId', ParseIntPipe) companyId) {
    return this.companiesService.getCompanyById(companyId);
  }

  @Delete(':companyId')
  deleteCompany(@Param('companyId', ParseIntPipe) companyId) {
    return this.companiesService.deleteCompanyById(companyId);
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
  @Get(':companyId/user')
  getAllUsersInCompany(@Param('companyId') companyId: string) {
    const id = parseInt(companyId);
    return this.companiesService.getUsersByCompanyId(id);
  }

  @CompanyRoles(CompanyRoleEnum.Admin, CompanyRoleEnum.Owner)
  @Delete(':companyId/user/:userId')
  removeUserFromCompany(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const companyId = parseInt(req.params.companyId);
    const usersId = parseInt(req.params.userId);
    return this.companiesService.removeUserFromCompany(companyId, usersId);
  }
}
