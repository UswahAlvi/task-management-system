import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CompanyInvite } from '../companies/entities/company-invite.entity';
import { UserCompany } from '../companies/entities/user-company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(CompanyInvite)
    private readonly companyInviteRepository: Repository<CompanyInvite>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<string> {
    const user: User = new User();
    user.username = createUserDto.username;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.password = await this.hashString(createUserDto.password);
    await this.userRepository.save(user);
    return 'successfully created user';
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
    return this.userRepository.find();
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
  findInvitationsToUser(userId: number): Promise<CompanyInvite[]> {
    return this.companyInviteRepository.find({ where: { sendTo: userId } });
  }
  findInvitationsToUserByInvitationId(
    userId: number,
    invitationId: number,
  ): Promise<CompanyInvite | null> {
    return this.companyInviteRepository.findOne({
      where: { id: invitationId, sendTo: userId },
    });
  }
  async acceptInvitation(
    userId: number,
    invitationId: number,
    acceptInvitation: string,
  ) {
    const companyInvite = await this.companyInviteRepository.findOne({
      where: { id: invitationId },
    });
    if (!companyInvite) return 'No such invite exists';
    if (acceptInvitation === 'accept') {
      const { companyId, role } = companyInvite;
      const userCompany = new UserCompany();
      userCompany.userId = userId;
      userCompany.companyId = companyId;
      userCompany.role = role;
      await this.userCompanyRepository.save(userCompany);
      await this.companyInviteRepository.delete(invitationId);
      return 'successfully accepted invitation';
    } else {
      await this.companyInviteRepository.delete(invitationId);
      return 'successfully rejected invitation';
    }
  }
  private async hashString(str: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(str, saltRounds);
  }
}
