import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../common/decorators/public.decorator';
import { User } from './entities/user.entity';
import * as authenticatedRequestInterface from '../common/interfaces/authenticated-request.interface';
import { CompanyInvite } from '../company/entities/company-invite.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Public()
  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  @Get('profile')
  Profile(@Req() req: authenticatedRequestInterface.AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.usersService.findOneById(userId);
  }

  @Patch('update-profile')
  updateProfile(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.sub;
    return this.usersService.updateUser(updateUserDto, userId);
  }

  @Delete()
  delete(
    @Body() credentials: { password: string },
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.usersService.deleteOne(userId, credentials.password);
  }
  @Public()
  @Get()
  findAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
  @Get('invitations-to-me')
  findInvitationsToMe(
    @Req()
    req: authenticatedRequestInterface.AuthenticatedRequest,
  ): Promise<CompanyInvite[]> {
    const userId = req.user.sub;
    return this.usersService.findInvitationsToUser(userId);
  }
  @Get('invitations-to-me/:invitationId')
  findInvitationToMeByInvitationId(
    @Param('invitationId') invitationId: number,
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.usersService.findInvitationsToUserByInvitationId(
      userId,
      invitationId,
    );
  }
  @Post('invitations-to-me/:invitationId/:accept')
  acceptInvitation(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
    @Param('invitationId') invitationId: number,
    @Param('accept') acceptInvitation: string,
  ) {
    const userId = req.user.sub;
    return this.usersService.acceptInvitation(
      userId,
      invitationId,
      acceptInvitation,
    );
  }

  @Get('my-companies')
  getMyCompanies(
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    return this.usersService.findMyCompanies(userId);
  }
}
