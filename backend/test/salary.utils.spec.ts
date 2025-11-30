import { computeUnpaidLeaveDeduction } from '../src/modules/payroll-tracking/utils/salary.utils';

describe('salary.utils', () => {
  test('computeUnpaidLeaveDeduction returns 0 when unpaidDays is 0', () => {
    expect(computeUnpaidLeaveDeduction(3000, 0)).toBe(0);
  });

  test('computeUnpaidLeaveDeduction calculates correctly with default working days', () => {
    const baseSalary = 3000; // monthly
    const unpaidDays = 2;
    const expected = Math.round((baseSalary / 22) * unpaidDays * 100) / 100;
    expect(computeUnpaidLeaveDeduction(baseSalary, unpaidDays)).toBe(expected);
  });

  test('computeUnpaidLeaveDeduction supports custom working days', () => {
    const baseSalary = 2200;
    const unpaidDays = 1;
    const expected = Math.round((baseSalary / 20) * unpaidDays * 100) / 100;
    expect(computeUnpaidLeaveDeduction(baseSalary, unpaidDays, 20)).toBe(expected);
  });
});
