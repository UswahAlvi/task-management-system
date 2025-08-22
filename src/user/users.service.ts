import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CompanyInvite } from '../company/entities/company-invite.entity';
import { UserCompany } from '../company/entities/user-company.entity';
import { Company } from '../company/entities/company.entity';

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
    const user: User = new User();
    user.username = createUserDto.username;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.password = await this.hashString(createUserDto.password);
    await this.userRepository.save(user);
    return `Successfully created user with username "${createUserDto.username}".`;
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
  async deleteOne({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<string> {
    const user: User | null = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) return 'no such user exists';
    const isMatch: boolean = await bcrypt.compare(password, user?.password);
    if (!isMatch) {
      return 'invalid user';
    }
    await this.userRepository.delete(user?.id);
    return 'successfully deleted user';
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
    } else {
      await this.companyInviteRepository.delete(invitationId);
      return 'Successfully rejected invitation';
    }
  }

  private async hashString(str: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(str, saltRounds);
  }
}
