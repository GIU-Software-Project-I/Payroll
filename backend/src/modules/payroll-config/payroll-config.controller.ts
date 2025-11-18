import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PayrollConfigService } from './payroll-config.service';

@Controller('payroll-config')
export class PayrollConfigController {
  constructor(private readonly svc: PayrollConfigService) {}

  // helper to map route to entity key
  private mapToKey(part: string) {
    const map = {
      allowances: 'allowances',
      paygrades: 'paygrades',
      policies: 'policies',
      paytypes: 'paytypes',
      deductions: 'deductions',
      'signing-bonuses': 'signingBonuses',
      'company-settings': 'companySettings',
      'insurance-brackets': 'insuranceBrackets',
      'resignation-compensations': 'resignationCompensations',
      'termination-benefits': 'terminationBenefits',
      'tax-rules': 'taxRules',
      approvals: 'approvals',
    } as Record<string, any>;
    return map[part];
  }

  // Generic list
  @Get(':entity')
  getAll(@Param('entity') entity: string) {
    const key = this.mapToKey(entity);
    return this.svc.findAll(key);
  }

  // Generic get one
  @Get(':entity/:id')
  getOne(@Param('entity') entity: string, @Param('id') id: string) {
    const key = this.mapToKey(entity);
    return this.svc.findOne(key, id);
  }

  // Generic create
  @Post(':entity')
  create(@Param('entity') entity: string, @Body() dto: any) {
    const key = this.mapToKey(entity);
    return this.svc.create(key, dto);
  }

  // Generic update
  @Put(':entity/:id')
  update(@Param('entity') entity: string, @Param('id') id: string, @Body() dto: any) {
    const key = this.mapToKey(entity);
    return this.svc.update(key, id, dto);
  }

  // Generic delete
  @Delete(':entity/:id')
  delete(@Param('entity') entity: string, @Param('id') id: string) {
    const key = this.mapToKey(entity);
    return this.svc.delete(key, id);
  }
}
