// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';

config(); // load .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`✅ Nest application is running at http://localhost:${port}`);
  console.log('MONGODB_URI from .env:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Not loaded');
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available after mongoose.connect()');
    }

    const departmentId = new mongoose.Types.ObjectId();

    const empRes = await db.collection('employees').insertOne({
      employeeNumber: 'E001',
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      departmentId,
      hireDate: new Date('2023-01-01'),
      status: 'active',
    });

    const employeeId = empRes.insertedId;

    const payslipRes = await db.collection('payslips').insertOne({
      employeeId,
      payrollCycle: new Date(),
      grossPay: 5000,
      netPay: 3700,
      status: 'generated',
      pdfUrl: 'https://example.com/payslip.pdf',
      items: [
        { label: 'Base Salary', type: 'income', amount: 4000 },
        { label: 'Transport Allowance', type: 'transport', amount: 200 },
        { label: 'Income Tax', type: 'tax', amount: 600 },
        { label: 'Health Insurance', type: 'insurance', amount: 200 },
        { label: 'Employer Pension Contribution', type: 'employerContribution', amount: 300 },
      ],
    });

    const payslipId = payslipRes.insertedId;

    const claimRes = await db.collection('claims').insertOne({
      employeeId,
      type: 'expense',
      category: 'travel',
      amountClaimed: 123.45,
      description: 'Taxi to client',
      attachments: [],
      status: 'submitted',
      actions: [],
    });

    const claimId = claimRes.insertedId;

    const disputeRes = await db.collection('disputes').insertOne({
      payslipId,
      employeeId,
      type: 'salary_error',
      description: 'Missing bonus for this cycle',
      status: 'pending',
    });

    const disputeId = disputeRes.insertedId;

    console.log('\nSeeding complete. Use these IDs in Postman environment variables:');
    console.log('employeeId =', employeeId.toString());
    console.log('payslipId  =', payslipId.toString());
    console.log('claimId    =', claimId.toString());
    console.log('disputeId  =', disputeId.toString());
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

void bootstrap();
