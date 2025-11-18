import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

type EntityKey =
  | 'allowances' | 'paygrades' | 'paytypes' | 'deductions' | 'signingBonuses'
  | 'companySettings' | 'insuranceBrackets' | 'resignationCompensations' | 'terminationBenefits'
  | 'taxRules' | 'approvals';

@Injectable()
export class PayrollConfigService {
  private readonly dummyDir = path.join(__dirname, 'dummy');

  // map logical keys to file names
  private fileMap: Record<EntityKey, string> = {
    allowances: 'allowance.json',
    paygrades: 'pay-grade.json',
    paytypes: 'pay-type.json',
    deductions: 'deduction.json',
    signingBonuses: 'signing-bonus.json',
    companySettings: 'company-settings.json',
    insuranceBrackets: 'insurance-bracket.json',
    resignationCompensations: 'resignation-compensation.json',
    terminationBenefits: 'termination-benefit.json',
    taxRules: 'tax-rule.json',
    approvals: 'approval.json',
  };

  private readFile(entity: EntityKey) {
    const file = path.join(this.dummyDir, this.fileMap[entity]);
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, 'utf8');
    try { return JSON.parse(raw || '[]'); } catch (e) { return []; }
  }

  private writeFile(entity: EntityKey, data: any[]) {
    const file = path.join(this.dummyDir, this.fileMap[entity]);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  }

  // GENERIC CRUD
  findAll(entity: EntityKey) {
    return this.readFile(entity);
  }

  findOne(entity: EntityKey, id: string) {
    const items = this.readFile(entity);
    return items.find((i: any) => i.id === id) || null;
  }

  create(entity: EntityKey, dto: any) {
    const items = this.readFile(entity);
    const id = Date.now().toString();
    const record = { id, ...dto };
    items.push(record);
    this.writeFile(entity, items);
    return record;
  }

  update(entity: EntityKey, id: string, dto: any) {
    const items = this.readFile(entity);
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) throw new NotFoundException(`${entity} ${id} not found`);
    items[idx] = { ...items[idx], ...dto };
    this.writeFile(entity, items);
    return items[idx];
  }

  delete(entity: EntityKey, id: string) {
    const items = this.readFile(entity);
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) throw new NotFoundException(`${entity} ${id} not found`);
    const [removed] = items.splice(idx, 1);
    this.writeFile(entity, items);
    return removed;
  }
}
