import axios from "axios";
import { toast } from "react-toastify";
import { env, commonErrorCodes, retryErrorCodes } from "../config/env";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const api = axios.create({
    baseURL: env.apiUrl,
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        // set header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // log details
        console.log('Request:', {
            method: config.method.toUpperCase(),
            url: config.url,
            data: config.data || 'No data',
        });

        // Axios does this by default
        if (config.data && typeof config.data !== "string") {
            config.data = JSON.stringify(config.data);
        }

        return config;
    },
    (error) => {
        console.error("request Error:", error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    // response => response,
    response => {
        const responseData = extractNestedResponseData(response);

        // log response
        console.log('Response:', {
            status: response.status,
            data: responseData,
            time: new Date().toLocaleTimeString(),
        });

        return responseData;
        // return response;
    },
    async (error) => {
        // if (error.response?.status === 401) {}
        // refresh token
        // logout
        // redirect

        const { response, message } = error;

        if (!response) {
            toast.error("Network Error: Please, check your internet connection.");
            return Promise.reject(error); // pass error to .catch()
        }

        shouldRetrySpecificFailedRequests(error);

        if (commonErrorCodes.includes(response.status)) {
            toast.error(`Error ${response.status}: ${response.data.message}`);
        }

        console.error('Response Error:', error);
        return Promise.reject(error); // pass error to .catch()
    }

);

async function shouldRetrySpecificFailedRequests(error) {

    const { response, config } = error;

    if (!config || config._retryCount >= MAX_RETRIES) {
        return Promise.reject(error); // pass error to .catch()
    }

    config._retryCount = config._retryCount || 0;

    if (retryErrorCodes.includes(response.status)) {

        config._retryCount += 1;

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return api(config);
    }
}

function extractNestedResponseData(response) {
    // extract nested data
    if (response.data && response.data.data) {

        return response.data.data;
    }
    return response.data;
}