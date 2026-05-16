import api from "@/lib/api";

export const propertyService = {
  async getProperties(params?: any) {
    const response = await api.get(
      "/admin/properties",
      {
        params,
      }
    );

    return response.data;
  },

  async createProperty(payload: any) {
    const response = await api.post(
      "/admin/properties",
      payload
    );

    return response.data;
  },

  async getPropertyCategories(params?: any) {
    const response = await api.get(
      "/admin/property-categories",
      {
        params,
      }
    );

    return response.data;
  },

  async createPropertyCategory(payload: any) {
    const response = await api.post(
      "/admin/property-categories",
      payload
    );

    return response.data;
  },

  async getCitizenProperties(params?: any) {
    const response = await api.get(
      "/admin/citizen-properties",
      {
        params,
      }
    );

    return response.data;
  },

  async assignCitizenProperty(payload: any) {
    const response = await api.post(
      "/admin/citizen-properties",
      payload
    );

    return response.data;
  },
};