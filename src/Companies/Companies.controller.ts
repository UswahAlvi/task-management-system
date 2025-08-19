import { Controller, Post, Req } from '@nestjs/common';
import { CompaniesService } from './Companies.service';

@Controller('companies')
export class UsersController {
  constructor(private readonly companiesService: CompaniesService) {}
  @Post('create')
  create() {}
}
