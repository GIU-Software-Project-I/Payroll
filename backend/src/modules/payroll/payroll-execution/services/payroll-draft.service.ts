import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import mongoose from 'mongoose';
import { payrollDraft, payrollDraftDocument, payrollDraftItem, payrollDraftItemSchema } from '../models/payrollDraft.schema';
import { payrollDraftItemSchema as _itemSchema } from '../models/payrollDraft.schema';
import { payrollDraftSchema } from '../models/payrollDraft.schema';
import { PayCalculatorService } from './payCalculator.service';
import { payGrade } from '../../payroll-configuration/models/payGrades.schema';
import { taxRules } from '../../payroll-configuration/models/taxRules.schema';

@Injectable()
export class PayrollDraftService {
  constructor(
    @InjectModel(payrollDraft.name) private readonly payrollDraftModel: Model<payrollDraftDocument>,
    @InjectModel(payrollDraftItem.name) private readonly payrollDraftItemModel: Model<any>,
    @InjectConnection() private readonly connection: Connection,
    private readonly calculator: PayCalculatorService,
  ) {}

  private get db() {
    return (this.connection && this.connection.db) ? this.connection.db : (mongoose && mongoose.connection && (mongoose.connection.db as any)) || null;
  }

  // generate a simple draft for given payrollRun doc
  async generateDraft(payrollRun: any, generatedBy: string) {
    if (!payrollRun) throw new BadRequestException('Missing payrollRun');
    const db = this.db;
    if (!db) throw new BadRequestException('Database unavailable');

    // fetch employees (simple: all employeeprofiles)
    const employees = await db.collection('employeeprofiles').find({}).toArray();
    const items: any[] = [];

    // fetch a simple tax rule and paygrade map
    const tax = await db.collection('taxrules').findOne({ status: 'approved' } as any) || await db.collection('taxrules').findOne({} as any) || { rate: 0 };
    const payGrades = await db.collection('paygrades').find({ status: 'approved' } as any).toArray();
    const payGradeByName: Record<string, any> = {};
    for (const pg of payGrades) payGradeByName[pg.grade] = pg;

    const daysInPeriod = 30;
    for (const emp of employees) {
      // find payGrade for employee via emp.payGradeId or emp.payGrade
      let baseSalary = emp.baseSalary ?? null;
      if (!baseSalary && emp.payGradeId) {
        try {
          const pg = await db.collection('paygrades').findOne({ _id: new mongoose.Types.ObjectId(emp.payGradeId) } as any);
          if (pg) baseSalary = pg.baseSalary;
        } catch (e) {}
      }
      if (!baseSalary && emp.payGrade) {
        const pg = payGradeByName[emp.payGrade];
        if (pg) baseSalary = pg.baseSalary;
      }
      if (!baseSalary) baseSalary = 0;

      const calc = this.calculator.calculate({ baseSalary, daysInPeriod, daysWorked: daysInPeriod, taxRatePct: tax.rate ?? 0 });
      const item = {
        payrollDraftId: null,
        employeeId: emp._id,
        baseSalary,
        allowances: 0,
        deductions: calc.deductions,
        penalties: 0,
        refunds: 0,
        bonus: 0,
        benefit: 0,
        netPay: calc.netPay,
        exceptions: [],
        status: 'ok',
      };
      items.push(item);
    }

    const draftDoc: any = {
      runId: payrollRun.runId || `PR-DRAFT-${Date.now()}`,
      payrollRunId: payrollRun._id,
      payrollPeriod: payrollRun.payrollPeriod || new Date(),
      entity: payrollRun.entity || 'default',
      totalEmployees: items.length,
      totalNetPay: items.reduce((s, it) => s + (it.netPay || 0), 0),
      exceptionCount: items.filter(i => (i.exceptions && i.exceptions.length)).length,
      generatedBy: generatedBy || 'system',
      generatedAt: new Date(),
    };

    const created = await this.payrollDraftModel.create(draftDoc as any);
    // attach draft id to items and insert
    const toInsert = items.map(i => ({ ...i, payrollDraftId: created._id }));
    // use native collection for items
    await db.collection('payrolldraftitems').insertMany(toInsert as any);

    return { draft: created, items: toInsert };
  }

  async getDraft(id: string) {
    const db = this.db;
    if (!db) return null;
    try {
      const oid = (() => { try { return new mongoose.Types.ObjectId(id); } catch (e) { return null; } })();
      const draft = oid ? await db.collection('payrolldrafts').findOne({ _id: oid } as any) : await db.collection('payrolldrafts').findOne({ _id: id } as any);
      if (!draft) return null;
      const items = await db.collection('payrolldraftitems').find({ payrollDraftId: draft._id } as any).toArray();
      return { draft, items };
    } catch (e) {
      return null;
    }
  }
}
