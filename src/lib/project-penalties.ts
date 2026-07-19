/**
 * Calculate late fees for a project based on penalty_per_day.
 * Penalties are calculated at render time — no cron job needed.
 */
export function calculateLateFee(
  deadline: string | null,
  penaltyPerDay: number,
  currentDate: Date = new Date()
): { daysLate: number; totalFee: number } {
  if (!deadline || penaltyPerDay <= 0) {
    return { daysLate: 0, totalFee: 0 };
  }

  const deadlineDate = new Date(deadline);
  if (currentDate <= deadlineDate) {
    return { daysLate: 0, totalFee: 0 };
  }

  const diffMs = currentDate.getTime() - deadlineDate.getTime();
  const daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const totalFee = daysLate * penaltyPerDay;

  return { daysLate, totalFee };
}

/**
 * Check if a milestone has passed its deadline without being approved.
 */
export function isMilestoneLate(
  deadline: string | null,
  status: string,
  currentDate: Date = new Date()
): boolean {
  if (!deadline) return false;
  if (status === 'approved' || status === 'rejected') return false;
  return currentDate > new Date(deadline);
}
