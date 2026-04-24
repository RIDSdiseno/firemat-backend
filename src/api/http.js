const API_URL = "http://localhost:3000";

export const http = {
  get: async (url) => {
    const res = await fetch(`${API_URL}${url}`);
    return res.json();
  },

  post: async (url, data) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  put: async (url, data) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (url) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "DELETE",
    });
    return res.json();
  },
};