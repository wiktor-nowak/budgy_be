function expiresInDays(days: number): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * days);
}

export default {
  expiresInDays,
};
