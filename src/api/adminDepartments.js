import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

const { link } = ENDPOINTS.adminDepartments;

export const getDepartments = (page) => api.get(link, {params: {page} });

export const storeDepartment = (data) => api.post(link, data);

export const updateDepartment = (id, data) => api.put(`${link}/${id}`, data);

export const showDepartment = (id) => api.get(`${link}/${id}`);

export const destroyDepartment = (id) => api.delete(`${link}/${id}`);