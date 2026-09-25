import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("retries", () => {
    // An error shaped the way axios hands it to the interceptor, with a
    // per-request adapter so the retry resolves without any network.
    const serverError = (status, overrides = {}) => ({
        config: requestConfig(overrides),
        response: { status, data: {} },
    });

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("retries a GET on 503 and hands the caller the retry's result", async () => {
        const adapter = vi.fn(async (config) => ({
            status: 200, statusText: "OK", headers: {}, config,
            data: { success: true, data: { id: 7 } },
        }));

        const result = onResponseError(serverError(503, { adapter }));
        await vi.advanceTimersByTimeAsync(1000);

        await expect(result).resolves.toEqual({ id: 7 });
        expect(adapter).toHaveBeenCalledOnce();
    });

    it("stops after 3 retries when the server keeps failing", async () => {
        const adapter = vi.fn(async (config) => {
            throw Object.assign(new Error("Service Unavailable"), {
                config, response: { status: 503, data: {} },
            });
        });

        const result = onResponseError(serverError(503, { adapter }));
        const settled = expect(result).rejects.toMatchObject({ response: { status: 503 } });
        await vi.advanceTimersByTimeAsync(3000);

        await settled;
        expect(adapter).toHaveBeenCalledTimes(3);
    });

    it("never retries a POST — resending could duplicate an order", async () => {
        const adapter = vi.fn();
        const error = serverError(503, { method: "post", url: "/orders", adapter });

        await expect(onResponseError(error)).rejects.toBe(error);
        // Let the whole retry window pass: a retry is delayed, so asserting
        // straight away would miss one scheduled in the background.
        await vi.advanceTimersByTimeAsync(3000);
        expect(adapter).not.toHaveBeenCalled();
    });

    it("rejects cleanly when the error has no config", async () => {
        const error = { response: { status: 503, data: {} } };

        await expect(onResponseError(error)).rejects.toBe(error);
    });
});

describe("logging", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("never logs the submitted password when a login fails", async () => {
        const error = {
            config: requestConfig({
                method: "post",
                url: "/admin/login",
                data: JSON.stringify({ email: "admin@shop.test", password: "hunter2" }),
            }),
            response: { status: 401, data: { message: "Either email/password is incorrect" } },
        };

        await expect(onResponseError(error)).rejects.toBe(error);

        const printed = JSON.stringify(console.error.mock.calls);
        expect(printed).toContain("/admin/login");
        expect(printed).not.toContain("hunter2");
    });

    it("keeps request and response bodies out of the production console", async () => {
        vi.stubEnv("DEV", false);

        await onRequest(requestConfig({ method: "post", data: { password: "hunter2" } }));
        await onResponse({ status: 200, data: { data: { token: "secret-token" } } });

        expect(console.log).not.toHaveBeenCalled();
    });
});
