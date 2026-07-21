import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

export const login = (data) =>  api.post(ENDPOINTS.adminAuth.login, data);
export const register = (data) => api.post(ENDPOINTS.adminAuth.register, data);
export const logout = () => api.post(ENDPOINTS.adminAuth.logout);