import { Injectable } from '@nestjs/common';

@Injectable()
export class PayrollNotificationService {
  notifyPayrollSpecialists(message: string, data?: any) {
    return true;
  }

  notifyPayrollManager(message: string, data?: any) {

    return true;
  }

  notifyFinanceStaff(message: string, data?: any) {

    return true;
  }
}
