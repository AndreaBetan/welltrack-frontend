const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const storageService = {
  get(key, fallback = []) {
    return parseJson(localStorage.getItem(key), fallback);
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};
