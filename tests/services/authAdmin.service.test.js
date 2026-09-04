import { beforeEach, describe, expect, it, vi } from "vitest";
import * as adminAuthApi from "../../src/api/adminAuth";
import { login, logout, register } from "../../src/services/authAdmin.service";

vi.mock("../../src/api/adminAuth", () => ({
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("authAdmin service", () => {
    it("passes credentials to the API and hands back the unwrapped session", async () => {
        const session = { token: "abc123", user: { id: 1, email: "admin@shop.test" } };
        adminAuthApi.login.mockResolvedValue(session);

        const result = await login({ email: "admin@shop.test", password: "secret" });

        expect(adminAuthApi.login).toHaveBeenCalledWith({
            email: "admin@shop.test",
            password: "secret",
        });
        expect(result).toEqual(session);
    });

    it("calls the logout endpoint that revokes the Sanctum token", async () => {
        adminAuthApi.logout.mockResolvedValue({ message: "Logged out" });

        const result = await logout();

        expect(adminAuthApi.logout).toHaveBeenCalledOnce();
        expect(result).toEqual({ message: "Logged out" });
    });

    it("forwards registration params", async () => {
        const params = { name: "Admin", email: "admin@shop.test", password: "secret" };
        adminAuthApi.register.mockResolvedValue({ id: 1 });

        const result = await register(params);

        expect(adminAuthApi.register).toHaveBeenCalledWith(params);
        expect(result).toEqual({ id: 1 });
    });

    it("lets API failures reach the caller instead of swallowing them", async () => {
        const failure = new Error("Request failed with status code 401");
        adminAuthApi.login.mockRejectedValue(failure);

        await expect(login({ email: "admin@shop.test", password: "wrong" })).rejects.toBe(failure);
    });
});
