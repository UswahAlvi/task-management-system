import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IntegerType, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CompanyInvite } from '../company/entities/company-invite.entity';
import { UserCompany } from '../company/entities/user-company.entity';
import { Company } from '../company/entities/company.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(CompanyInvite)
    private readonly companyInviteRepository: Repository<CompanyInvite>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<string> {
    const usernameExists = await this.userRepository.exists({
      where: { username: createUserDto.username },
    });
    if (usernameExists)
      return 'Username already exists';
    const user: User = new User();
    user.username = createUserDto.username;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto?.lastname;
    user.password = await this.hashString(createUserDto.password);
    await this.userRepository.save(user);
    return `Successfully created user with username "${createUserDto.username}".`;
  }
  async updateUser(
    updateUserDto: UpdateUserDto,
    userId: number,
  ): Promise<string> {
    updateUserDto.password = await this.hashString(updateUserDto.password);
    const result = await this.userRepository.update(userId, updateUserDto);
    if (result.affected === 0) return 'no such record found with your user id';
    return 'Updated Profile successfully.';
  }

  async findOneById(id: number) {
    return await this.userRepository.findOne({
      select: { username: true, firstname: true },
      where: { id },
    });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: { id: true, username: true, firstname: true },
    });
  }

  async deleteOne(userId: number, password: string): Promise<string> {
    if (!password) {
      throw new NotFoundException('Please provide password');
    }
    const user: User | null = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) return 'No such user exists.';
    const isMatch: boolean = await bcrypt.compare(password, user?.password);
    if (!isMatch) {
      return 'invalid user';
    }
    await this.userRepository.delete(user?.id);
    return 'Successfully deleted user.';
  }
  async findMyCompanies(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return 'No such user exists.';
    const companies = await this.userCompanyRepository
      .createQueryBuilder('userCompany')
      .leftJoinAndSelect('userCompany.companyId', 'company')
      .select(['company.name', 'userCompany.role'])
      .where('userCompany.userId=:userId', { userId })
      .getMany();
    if (companies) {
      return companies;
    }
    return 'No companies found.';
  }

  async findInvitationsToUser(userId: number): Promise<CompanyInvite[]> {
    const sendToUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!sendToUser)
      throw new Error('no user found with that id for sending invite');
    return this.companyInviteRepository.find({ where: { sendTo: sendToUser } });
  }
  async findInvitationsToUserByInvitationId(
    userId: number,
    invitationId: number,
  ): Promise<CompanyInvite | null> {
    const sendToUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!sendToUser)
      throw new Error('no user found with that id for sending invite');
    return this.companyInviteRepository.findOne({
      where: { id: invitationId, sendTo: sendToUser },
    });
  }
  async acceptInvitation(
    userId: number,
    invitationId: number,
    acceptInvitation: string,
  ) {
    const companyInvite = await this.companyInviteRepository.findOne({
      where: { id: invitationId },
      relations: ['sendTo', 'companyId'],
    });

    if (!companyInvite) return 'No such invite exists';

    if (companyInvite.sendTo.id !== userId) {
      return 'You are not authorized to respond to this invitation';
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return 'No user exists against that ID';

    const company = await this.companyRepository.findOne({
      where: { id: companyInvite.companyId.id },
    });
    if (!company) return 'No such company exists';

    if (acceptInvitation === 'accept') {
      const { role } = companyInvite;

      const userCompany = new UserCompany();
      userCompany.userId = user;
      userCompany.companyId = company;
      userCompany.role = role;

      await this.userCompanyRepository.save(userCompany);
      await this.companyInviteRepository.delete(invitationId);

      return 'Successfully accepted invitation';
    } else if (acceptInvitation === 'reject') {
      await this.companyInviteRepository.delete(invitationId);
      return 'Successfully rejected invitation';
    } else {
      return 'you can only put "accept" or "reject" in url.';
    }
  }

  private async hashString(str: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(str, saltRounds);
  }
}
