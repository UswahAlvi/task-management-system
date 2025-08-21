import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../Guards/public.decorator';
import { User } from './entities/user.entity';
import * as authenticatedRequestInterface from '../companies/interfaces/authenticated-request.interface';
import { CompanyInvite } from '../companies/entities/company-invite.entity';

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

  @Post('delete')
  delete(@Body() credentials: { username: string; password: string }) {
    return this.usersService.deleteOne(credentials);
  }
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
}
