import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import { api } from "../../src/api/client";

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn() },
}));

const onRequest = api.interceptors.request.handlers[0].fulfilled;
const onResponse = api.interceptors.response.handlers[0].fulfilled;
const onResponseError = api.interceptors.response.handlers[0].rejected;

const requestConfig = (overrides = {}) => ({
    method: "get",
    url: "/admin/categories",
    headers: {},
    ...overrides,
});

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    Object.defineProperty(window, "location", {
        value: { href: "" },
        writable: true,
        configurable: true,
    });
});

describe("request interceptor", () => {
    it("takes the token out of the adminStorage blob Login.jsx writes", async () => {
        localStorage.setItem("adminStorage", JSON.stringify({ token: "abc123", email: "a@b.c" }));

        const config = await onRequest(requestConfig());

        expect(config.headers.Authorization).toBe("Bearer abc123");
    });

    it("sends no Authorization header when nobody is logged in", async () => {
        const config = await onRequest(requestConfig());

        expect(config.headers.Authorization).toBeUndefined();
    });
});

describe("response interceptor", () => {
    it("unwraps the API's nested data envelope", async () => {
        const payload = { user: { id: 1 }, token: "abc123" };

        const result = await onResponse({ status: 200, data: { success: true, data: payload } });

        expect(result).toEqual(payload);
    });

    it("returns the body as-is when it is not nested", async () => {
        const body = { success: true, message: "OK" };

        const result = await onResponse({ status: 200, data: body });

        expect(result).toEqual(body);
    });
});

describe("401 handling", () => {
    it("clears the session and redirects when a protected route rejects the token", async () => {
        localStorage.setItem("adminStorage", JSON.stringify({ token: "expired" }));
        const error = {
            config: requestConfig(),
            response: { status: 401, data: { message: "Unauthenticated." } },
        };

        await expect(onResponseError(error)).rejects.toBe(error);

        expect(localStorage.getItem("adminStorage")).toBeNull();
        expect(window.location.href).toBe("/admin/login");
    });

    it("leaves the login page alone so a wrong password does not wipe the form", async () => {
        const error = {
            config: requestConfig({ url: "/admin/login", method: "post" }),
            response: { status: 401, data: { message: "Either email/password is incorrect" } },
        };

        await expect(onResponseError(error)).rejects.toBe(error);

        expect(window.location.href).toBe("");
        expect(toast.error).toHaveBeenCalledWith("Error 401: Either email/password is incorrect");
    });
});

describe("network errors", () => {
    it("toasts when the request never reached the API", async () => {
        const error = { config: requestConfig(), response: undefined };

        await expect(onResponseError(error)).rejects.toBe(error);

        expect(toast.error).toHaveBeenCalledWith("Network Error: Please, check your internet connection.");
    });
});
