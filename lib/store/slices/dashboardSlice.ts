import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Order, OrderQuery } from "@/lib/types/order";
import {
  ordersApi,
  handleApiResponse,
  handleApiError,
} from "@/lib/services/apiService";

// Dashboard state interface
export interface DashboardState {
  // Orders data
  orders: Order[];
  totalOrders: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Statistics
  stats: {
    total: number;
    totalAmount: number;
    averageAmount: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    byLocation: Record<string, number>;
  } | null;

  // Filters
  filters: {
    category?: string;
    source?: string;
    geo?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy: "date" | "customer" | "amount" | "createdAt";
    sortOrder: "asc" | "desc";
  };

  // UI state
  loading: {
    orders: boolean;
    stats: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  error: string | null;
  selectedOrder: Order | null;
}

// Initial state
const initialState: DashboardState = {
  orders: [],
  totalOrders: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  stats: null,
  filters: {
    sortBy: "date",
    sortOrder: "desc",
  },
  loading: {
    orders: false,
    stats: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
  selectedOrder: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  "dashboard/fetchOrders",
  async (query: Partial<OrderQuery> = {}, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrders(query);
      return handleApiResponse(response);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getStats();
      return handleApiResponse(response);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createOrder = createAsyncThunk(
  "dashboard/createOrder",
  async (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await ordersApi.createOrder(orderData);
      return handleApiResponse(response);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateOrder = createAsyncThunk(
  "dashboard/updateOrder",
  async (
    { id, data }: { id: string; data: Partial<Order> },
    { rejectWithValue }
  ) => {
    try {
      const response = await ordersApi.updateOrder(id, data);
      return handleApiResponse(response);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "dashboard/deleteOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      await ordersApi.deleteOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Filter actions
    setFilters: (
      state,
      action: PayloadAction<Partial<DashboardState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = {
        sortBy: "date",
        sortOrder: "desc",
      };
    },

    // Pagination actions
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when changing limit
    },

    // UI actions
    clearError: (state) => {
      state.error = null;
    },

    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading.orders = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.totalOrders = action.payload.pagination.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading.stats = true;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.orders.unshift(action.payload);
        state.totalOrders += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload as string;
      });

    // Update order
    builder
      .addCase(updateOrder.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading.updating = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload as string;
      });

    // Delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.loading.deleting = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading.deleting = false;
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload
        );
        state.totalOrders -= 1;
        if (state.selectedOrder?.id === action.payload) {
          state.selectedOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  clearError,
  setSelectedOrder,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
