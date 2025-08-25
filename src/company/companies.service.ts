import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IntegerType, Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyInviteDto } from './dto/create-company-invite.dto';
import { CompanyInvite } from './entities/company-invite.entity';
import { UserCompany } from './entities/user-company.entity';
import { CompanyRoleEnum } from '../common/enums/companyRole.enum';
import { User } from '../user/entities/user.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(CompanyInvite)
    private readonly companiesInviteRepository: Repository<CompanyInvite>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getAllCompanies() {
    return this.companiesRepository.find({});
  }

  async create(id: number, companyName: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return 'something went wrong';
    }
    const company = new Company();
    company.owner = user;
    company.name = companyName;
    await this.companiesRepository.save(company);
    const userCompany = new UserCompany();
    userCompany.companyId = company;
    userCompany.userId = user;
    userCompany.role = CompanyRoleEnum.Owner;
    await this.userCompanyRepository.save(userCompany);
    return `Company named "${company.name}" created successfully.`;
  }
  async updateCompany(id: number, updateCompanyDto: UpdateCompanyDto) {
    const result = await this.companiesRepository.update(id, {
      name: updateCompanyDto.companyName,
    });
    if (result.affected === 0)
      throw new NotFoundException('No records updated');
    else return 'Company updated';
  }

  async getCompanyById(id: IntegerType) {
    const company = await this.companiesRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.owner', 'owner')
      .select(['company.id', 'company.name', 'owner.id', 'owner.username'])
      .where('company.id = :id', { id })
      .getOne();

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async deleteCompanyById(id: number) {
    const result = await this.companiesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No records deleted');
    }
    return 'Company deleted';
  }

  async sendInvite(
    userId: number,
    companyId: number,
    createCompanyInviteDto: CreateCompanyInviteDto,
  ) {
    if (!companyId) {
      return 'Please provide a valid company ID.';
    }
    if (!createCompanyInviteDto.sendTo) {
      return 'Please provide a valid sendTo';
    }

    if (userId === createCompanyInviteDto.sendTo) {
      return 'You cannot invite yourself. Please invite someone else.';
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('No user found');

    const [company, sendToUser, sendByUser] = await Promise.all([
      this.companiesRepository.findOne({ where: { id: companyId } }),
      this.userRepository.findOne({
        where: { id: createCompanyInviteDto.sendTo },
      }),
      this.userCompanyRepository.findOne({ where: { userId: user } }),
    ]);


    if (!company) return 'No company found with the provided ID.';
    if (!sendToUser) return 'No user found with the provided invitee ID.';
    if (!sendByUser) throw new Error('No user found with sender ID.');

    const validRoles = [CompanyRoleEnum.Admin, CompanyRoleEnum.Viewer];
    if (!validRoles.includes(createCompanyInviteDto.role)) {
      return 'The role must be either "admin" or "viewer".';
    }

    const [inviteExists, userInCompany] = await Promise.all([
      this.companiesInviteRepository.findOne({
        where: { sendTo: sendToUser, companyId: company },
      }),
      this.userCompanyRepository.exists({
        where: { userId: sendToUser, companyId: company },
      }),
    ]);

    if (inviteExists) {
      return 'An invite has already been sent to this user for this company.';
    }

    if (userInCompany) {
      return 'This user is already part of the company.';
    }

    const companyInvite = new CompanyInvite();
    companyInvite.companyId = company;
    companyInvite.sendTo = sendToUser;
    companyInvite.sendBy = sendByUser;
    companyInvite.role = createCompanyInviteDto.role;
    companyInvite.accepted = false;
    await this.companiesInviteRepository.save(companyInvite);
    return 'Successfully sent the invite.';
  }

  async viewMyCompanies(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return 'no user found';
    }
    return await this.userCompanyRepository
      .createQueryBuilder('userCompany')
      .leftJoinAndSelect('userCompany.companyId', 'company')
      .select(['userCompany.role', 'company.name'])
      .where('userCompany.userId = :userId', { userId })
      .getMany();
  }

  async getRolesByCompanyIdAndUserId(
    userId: number,
    companyId: number,
  ): Promise<CompanyRoleEnum[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('no user found with that id');
    }
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('no company found with that id');
    const userCompanies = await this.userCompanyRepository.find({
      select: { role: true },
      where: { userId: user, companyId: company },
    });
    return userCompanies.map((uc) => uc.role);
  }

  async getInvitesByCompanyIdAndUserId(sendBy: number, companyId: number) {
    return this.companiesInviteRepository
      .createQueryBuilder('companyInvites')
      .leftJoinAndSelect('companyInvites.sendBy', 'sendBy')
      .select(['companyInvites.id', 'sendBy.name'])
      .where('sendBy.id = :sendBy', { sendBy })
      .andWhere('companyInvites.companyIdId = :companyId', { companyId })
      .getMany();
  }



  async getUsersByCompanyId(companyId: number) {

    return await this.userCompanyRepository
      .createQueryBuilder('userCompany')
      .leftJoinAndSelect('userCompany.companyId', 'company')
      .leftJoinAndSelect('userCompany.userId', 'user')
      .select(['userCompany.role', 'user.username'])
      .where('company.id = :companyId', { companyId })
      .getMany();
  }


  async removeUserFromCompany(companyId: number, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('no user found with that id');
    }
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });
    if (!company) throw new Error('no company found with that id');
    const flag = await this.userCompanyRepository.exists({
      where: { companyId: company, userId: user },
    });
    if (!flag) {
      return 'no such user exists in company';
    }
    await this.userCompanyRepository.delete({
      companyId: company,
      userId: user,
    });
    return `User ${userId} removed successfully from company ${companyId}`;
  }

  async isAdmin(userId: number, companyId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('no user found with that id');
    }
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });
    if (!company) throw new Error('no company found with that id');
    return await this.userCompanyRepository.exists({
      where: { companyId: company, userId: user, role: CompanyRoleEnum.Admin },
    });
  }

  async isOwner(userId: number, companyId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('no user found with that id');
    }
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });
    if (!company) throw new Error('no company found with that id');
    return await this.userCompanyRepository.exists({
      where: { companyId: company, userId: user, role: CompanyRoleEnum.Owner },
    });
  }
}
