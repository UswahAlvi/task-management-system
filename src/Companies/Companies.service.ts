import { Injectable } from '@nestjs/common';
import { CompanyInterface } from './interfaces/Company.interface';

@Injectable()
export class CompaniesService {
  private readonly companies: CompanyInterface[] = [];
  create(company: CompanyInterface) {
    this.companies.push(company);
  }
}
