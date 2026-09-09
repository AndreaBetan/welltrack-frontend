export const round = (value, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round(Number(value || 0) * factor) / factor;
};

export const roundNullable = (value, decimals = 1) =>
  value == null || value === "" || !Number.isFinite(Number(value))
    ? null
    : round(value, decimals);
