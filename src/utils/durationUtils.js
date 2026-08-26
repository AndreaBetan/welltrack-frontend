export const formatMinutes = (minutes) => {
  const total = Math.max(0, Math.round(Number(minutes || 0)));
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return `${hours} h${remainder ? ` ${remainder} min` : ""}`;
};
