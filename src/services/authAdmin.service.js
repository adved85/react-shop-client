import * as adminAuthApi from "../api/adminAuth";

export async function login(credentials) {
    const response = await adminAuthApi.login(credentials);
    return response;
}

export async function logout() {
    const response = await adminAuthApi.logout();
    return response;
}

export async function register(params) {
    const response = await adminAuthApi.register(params);
    return response;
}