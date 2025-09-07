/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import {
  Order,
  OrderQuery,
  OrderListResponse,
  ApiResponse,
} from "@/lib/types/order";
import { toast } from "@/lib/components/ui/Toast";
import { store } from "@/lib/store";
import { selectToken } from "@/lib/store/slices/authSlice";
import { getApiBaseUrl } from "@/lib/utils/apiConfig";

// Extend Axios types to include custom metadata
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// API configuration
const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: Date.now() };

    // Add auth token if available (from Redux store or localStorage fallback)
    let token = selectToken(store.getState());

    // Fallback to localStorage for backward compatibility
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("auth-token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = Date.now() - (response.config.metadata?.startTime || 0);

    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        } (${duration}ms)`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    return response;
  },
  (error: AxiosError) => {
    // Calculate request duration
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);

    // Log error
    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      } (${duration}ms)`,
      {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      }
    );

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Only handle 401 if not on auth pages to prevent loops
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            const isOnAuthPage =
              currentPath.startsWith("/auth/") || currentPath === "/";

            localStorage.removeItem("auth-token");

            if (!isOnAuthPage) {
              toast.error("Authentication required. Please log in.");
              window.location.href = "/auth/login";
            }
          }
          break;
        case 403:
          toast.error(
            "Access denied. You do not have permission to perform this action."
          );
          break;
        case 404:
          toast.error("Resource not found.");
          break;
        case 422:
          // Validation errors
          const apiResponse = data as ApiResponse;
          if (apiResponse.error?.message) {
            toast.error(apiResponse.error.message);
          } else {
            toast.error("Invalid data provided.");
          }
          break;
        case 429:
          toast.error("Too many requests. Please try again later.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          const errorMessage =
            (data as ApiResponse)?.error?.message ||
            "An unexpected error occurred.";
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection and try again.");
    } else {
      // Other error
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

// Orders API service
export const ordersApi = {
  // Get all orders with filtering and pagination
  getOrders: async (
    query: Partial<OrderQuery> = {}
  ): Promise<AxiosResponse<ApiResponse<OrderListResponse>>> => {
    return apiClient.get("/api/orders", { params: query });
  },

  // Get single order by ID
  getOrder: async (id: string): Promise<AxiosResponse<ApiResponse<Order>>> => {
    return apiClient.get(`/api/orders/${id}`);
  },

  // Create new order
  createOrder: async (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ): Promise<AxiosResponse<ApiResponse<Order>>> => {
    return apiClient.post("/api/orders", orderData);
  },

  // Update existing order
  updateOrder: async (
    id: string,
    orderData: Partial<Order>
  ): Promise<AxiosResponse<ApiResponse<Order>>> => {
    return apiClient.put(`/api/orders/${id}`, orderData);
  },

  // Delete order
  deleteOrder: async (
    id: string
  ): Promise<AxiosResponse<ApiResponse<void>>> => {
    return apiClient.delete(`/api/orders/${id}`);
  },

  // Get order statistics
  getStats: async (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get("/api/orders/stats");
  },
};

// Utility functions for API responses
export const handleApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T>>
): T => {
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error?.message || "API request failed");
};

export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const apiResponse = error.response?.data as ApiResponse;
    return apiResponse?.error?.message || error.message || "An error occurred";
  }
  return error.message || "An unexpected error occurred";
};

// Export the configured axios instance for custom requests
export { apiClient };
export default ordersApi;
