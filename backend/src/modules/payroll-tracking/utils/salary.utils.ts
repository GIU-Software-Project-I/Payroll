export function computeUnpaidLeaveDeduction(baseSalary: number, unpaidDays: number, workingDaysPerPeriod = 22) {
  if (!baseSalary || !unpaidDays) return 0;
  const dailyRate = baseSalary / workingDaysPerPeriod;
  const deduction = dailyRate * unpaidDays;
  // round to 2 decimals
  return Math.round(deduction * 100) / 100;
}
