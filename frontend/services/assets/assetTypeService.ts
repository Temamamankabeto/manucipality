const API_URL = "http://localhost:8000/api/admin";

export const assetTypeService = {
  // GET all with pagination
  async getAll(page = 1) {
    const res = await fetch(`${API_URL}/asset-types?page=${page}`);
    return res.json();
  },

  // GET single
  async getById(id: number) {
    const res = await fetch(`${API_URL}/asset-types/${id}`);
    return res.json();
  },

  // CREATE
  async create(data: { name: string; description?: string }) {
    const res = await fetch(`${API_URL}/asset-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  // UPDATE
  async update(id: number, data: { name?: string; description?: string }) {
    const res = await fetch(`${API_URL}/asset-types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  // DELETE
  async remove(id: number) {
    const res = await fetch(`${API_URL}/asset-types/${id}`, {
      method: "DELETE",
    });

    return res.json();
  },
};