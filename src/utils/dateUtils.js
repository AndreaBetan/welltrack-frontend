// Los campos DATE pueden llegar como "YYYY-MM-DD" o como un timestamp ISO.
// Si incluyen hora, primero se convierten a la zona local para evitar desfases.
export const toLocalDateValue = (value) => {
  if (!value) return "";

  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text.slice(0, 10);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayLocalDate = () => toLocalDateValue(new Date());

export const parseLocalDate = (value) => {
  const normalizedDate = toLocalDateValue(value);
  const [year, month, day] = normalizedDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};
