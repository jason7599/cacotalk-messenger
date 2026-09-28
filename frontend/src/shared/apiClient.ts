import axios from "axios";
import { ApiError, type ApiErrorResponse } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// artificial delay for dev to see loading states better
// TODO: cleanup
const DEV_API_DELAY_MS = import.meta.env.DEV
    ? Number(import.meta.env.VITE_DEV_API_DELAY_MS ?? 0)
    : 0
;

async function devDelay() {
    if (DEV_API_DELAY_MS > 0) {
        await new Promise((r) => 
            setTimeout(r, DEV_API_DELAY_MS)
        );
    }
}

api.interceptors.response.use(
    async (response) => {
        await devDelay();
        return response;
    },

    async (err: unknown) => {
        await devDelay();

        // hey it's my backend defined error!
        if (axios.isAxiosError<ApiErrorResponse>(err) && err.response) {
            const data = err.response.data;

            return Promise.reject(
                new ApiError(
                    data.code,
                    data.message
                )
            );
        }

        return Promise.reject(err);
    }
)

export default api;