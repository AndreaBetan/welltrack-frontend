const API_URL = import.meta.env.VITE_API_URL;

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("WTK");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("WTK");
  }

  if (!response.ok) {
    const error = new Error(result.message || "No se pudo completar la solicitud");
    // Conservar el estado HTTP permite tratar respuestas esperadas, como una
    // distribución nutricional que todavía no se ha configurado.
    error.status = response.status;
    throw error;
  }

  return result.data;
};
