import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyInviteDto } from './dto/create-company-invite.dto';
import { CompanyInvite } from './entities/company-invite.entity';
import { UserCompany } from './entities/user-company.entity';
import { CompanyRoleEnum } from '../Guards/companyRole.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(CompanyInvite)
    private readonly companiesInviteRepository: Repository<CompanyInvite>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  async create(id: number, companyName: string): Promise<string> {
    const company = new Company();
    company.owner = id;
    company.name = companyName;
    await this.companiesRepository.save(company);
    const userCompany = new UserCompany();
    userCompany.companyId = company.id;
    userCompany.userId = id;
    userCompany.role = CompanyRoleEnum.Owner;
    await this.userCompanyRepository.save(userCompany);
    return `Company ${company.name} created successfully`;
  }

  async getCompanyById(id: number) {
    const company = await this.companiesRepository.findOne({
      select: { name: true, owner: true },
      where: { id },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async sendInvite(
    userId: number,
    companyId: number,
    createCompanyInviteDto: CreateCompanyInviteDto,
  ) {
    if (companyId === undefined) {
      return 'please provide a valid companyId';
    }
    if (userId === createCompanyInviteDto.sendTo) {
      return 'You are sending invite to your own-self, please invite others.';
    }
    const alreadySent = await this.companiesInviteRepository.findOne({
      where: { sendTo: createCompanyInviteDto.sendTo, companyId: companyId },
    });
    if (alreadySent) {
      return 'An invite already sent to this user for your company';
    }
    if (
      createCompanyInviteDto.role !== CompanyRoleEnum.Admin &&
      createCompanyInviteDto.role !== CompanyRoleEnum.Member
    ) {
      return 'The role can either be admin or member. Please provide a valid role';
    }
    const exists = await this.userCompanyRepository.exists({
      where: { userId: createCompanyInviteDto.sendTo },
    });
    if (exists) {
      return 'user already exists in company';
    }
    const companyInvite = new CompanyInvite();
    companyInvite.companyId = companyId;
    companyInvite.sendTo = createCompanyInviteDto.sendTo;
    companyInvite.sendBy = userId;
    companyInvite.role = createCompanyInviteDto.role;
    companyInvite.accepted = false;
    await this.companiesInviteRepository.save(companyInvite);
    return 'successfully sent invite';
  }
  viewMyCompanies(userId: number) {
    return this.userCompanyRepository.find({
      select: { companyId: true, role: true },
      where: { userId },
    });
  }
  async getRolesByCompanyIdAndUserId(
    userId: number,
    companyId: number,
  ): Promise<CompanyRoleEnum[]> {
    const userCompanies = await this.userCompanyRepository.find({
      select: { role: true },
      where: { userId: userId, companyId: companyId },
    });
    return userCompanies.map((uc) => uc.role);
  }

  async getInvitesByCompanyIdAndUserId(
    sendBy: number,
    companyId: number,
  ): Promise<CompanyInvite[]> {
    return await this.companiesInviteRepository.find({
      where: { sendBy, companyId },
    });
  }

  async getUsersByCompanyId(companyId: number) {
    return await this.userCompanyRepository.find({ where: { companyId } });
  }

  async removeUserFromCompany(companyId: number, userId: number) {
    const flag = await this.userCompanyRepository.exists({
      where: { companyId, userId },
    });
    if (!flag) {
      return 'no such user exists in company';
    }
    await this.userCompanyRepository.delete({ companyId, userId });
    return `User ${userId} removed successfully from company ${companyId}`;
  }
}
