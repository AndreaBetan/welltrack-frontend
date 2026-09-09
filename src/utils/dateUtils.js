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

export const addDays = (value, amount) => {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + amount);
  return toLocalDateValue(date);
};

export const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseLocalDate(value)).replace(" de ", " ");
};

export const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
    : "—";

export const toDateOnlyValue = (value) => value ? String(value).slice(0, 10) : "";
