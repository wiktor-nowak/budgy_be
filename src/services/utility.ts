function expiresInDays(days: number): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * days);
}

function stripDate(date: Date): { month: number; year: number } {
  return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
}

export default {
  expiresInDays,
  stripDate,
};
