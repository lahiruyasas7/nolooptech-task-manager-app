import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: {
    Accept: "application/json",
  },
});

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.length > 0) {
    return payload;
  }

  if (!isRecord(payload) || !("message" in payload)) {
    return fallback;
  }

  const { message } = payload;
  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === "string",
    );
    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  return fallback;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? null;
    const responseData: unknown = error.response?.data;
    const message = getApiMessage(
      responseData,
      status === null ? "Unable to connect to the API." : error.message,
    );

    return Promise.reject(new ApiError(message, status));
  },
);

function getData<T>(response: AxiosResponse<T>): T {
  return response.data;
}

export const api = {
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return getData(await apiClient.get<T>(path, config));
  },

  async post<TResponse, TBody>(
    path: string,
    body: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    return getData(await apiClient.post<TResponse>(path, body, config));
  },

  async patch<TResponse, TBody>(
    path: string,
    body: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    return getData(await apiClient.patch<TResponse>(path, body, config));
  },

  async delete(path: string, config?: AxiosRequestConfig): Promise<void> {
    await apiClient.delete(path, config);
  },
};
