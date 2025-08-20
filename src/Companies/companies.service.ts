import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyInviteDto } from './dto/create-company-invite.dto';
import { CompanyInvite } from './entities/company-invite.entity';
import { UserCompany } from './entities/user-company.entity';
import { Role } from '../users/role.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(CompanyInvite)
    private readonly CompaniesInviteRepository: Repository<CompanyInvite>,
    @InjectRepository(UserCompany)
    private readonly UserCompanyRepository: Repository<UserCompany>,
  ) {}

  async create(id: number, companyName: string): Promise<string> {
    const company = new Company();
    company.owner = id;
    company.name = companyName;
    await this.companiesRepository.save(company);
    const userCompany = new UserCompany();
    userCompany.companyId = company.id;
    userCompany.userId = id;
    userCompany.role = Role.Owner;
    await this.UserCompanyRepository.save(userCompany);
    return `Company ${company.name} created successfully`;
  }

  sendInvite(
    userId: number,
    companyId: number,
    createCompanyInviteDto: CreateCompanyInviteDto,
  ) {
    const companyInvite = new CompanyInvite();
    companyInvite.companyId = companyId;
    companyInvite.sendTo = createCompanyInviteDto.sendTo;
    companyInvite.sendBy = userId;
    companyInvite.role = createCompanyInviteDto.role;
    companyInvite.accepted = false;
    return this.CompaniesInviteRepository.save(companyInvite);
  }
  viewMyCompanies(userId: number) {
    return this.companiesRepository.find({ where: { owner: userId } });
  }
  getRolesByCompanyIdAndUserId(
    userId: number,
    companyId: number,
  ): Promise<UserCompany[]> {
    return this.UserCompanyRepository.find({
      select: { role: true },
      where: { userId: userId, companyId: companyId },
    });
  }

  getInvitesByCompanyIdAndUserId(
    sendBy: number,
    companyId: number,
  ): Promise<CompanyInvite[]> {
    return this.CompaniesInviteRepository.find({
      where: { sendBy, companyId },
    });
  }
}
