/**
 * Authentication slice using Redux Toolkit
 *
 * This slice manages authentication state including:
 * - User authentication status
 * - User profile data
 * - JWT token management
 * - Login/register/logout operations
 * - Error handling and loading states
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";
import {
  AuthState,
  PublicUser,
  LoginRequest,
  RegisterRequest,
  UpdateProfile,
  ChangePassword,
} from "@/lib/types/auth";
import { authApi } from "@/lib/utils/httpClient";
import * as ToastModule from "@/lib/components/ui/Toast";

// Initial state matching the existing AuthContext state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Start with false, will be set to true during rehydration
  error: null,
};

// Async thunk for checking authentication status
export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      // Get token from persisted state (handled by redux-persist)
      const response = await authApi.me();

      if (response.data.success && response.data.data) {
        return {
          user: response.data.data,
          // Token will be available from persisted state
        };
      } else {
        throw new Error("Authentication verification failed");
      }
    } catch (error: any) {
      console.error("Auth check error:", error);
      return rejectWithValue(
        error.response?.data?.error?.message || "Authentication check failed"
      );
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const data = response.data;

      if (data.success && data.data) {
        const { user, token } = data.data;

        // Store token in localStorage for compatibility with existing tests and components
        if (typeof window !== "undefined") {
          localStorage.setItem("auth-token", token);
        }

        // Show success toast
        ToastModule.authToasts.loginSuccess(user.name);

        return { user, token };
      } else {
        const errorMessage = data.error?.message || "Login failed";
        ToastModule.authToasts.loginError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message || "Login failed";
      ToastModule.authToasts.loginError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      const data = response.data;

      if (data.success && data.data) {
        const { user, token } = data.data;

        // Store token in localStorage for compatibility with existing tests and components
        if (typeof window !== "undefined") {
          localStorage.setItem("auth-token", token);
        }

        // Show success toast
        ToastModule.authToasts.registerSuccess(user.name);

        return { user, token };
      } else {
        const errorMessage = data.error?.message || "Registration failed";
        ToastModule.authToasts.registerError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Registration failed";
      ToastModule.authToasts.registerError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API if needed
      await authApi.logout();

      // Remove token from localStorage for compatibility with existing tests and components
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
      }

      // Show success toast
      ToastModule.authToasts.logoutSuccess();

      return null;
    } catch (error: any) {
      console.error("Logout error:", error);
      // Even if API call fails, we should still logout locally
      // Remove token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
      }
      ToastModule.authToasts.logoutSuccess();
      return null;
    }
  }
);

// Async thunk for updating profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: UpdateProfile, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData);
      const data = response.data;

      if (data.success && data.data) {
        ToastModule.authToasts.profileUpdateSuccess();
        return data.data;
      } else {
        const errorMessage = data.error?.message || "Profile update failed";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Profile update failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for changing password
export const changeUserPassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData: ChangePassword, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      const data = response.data;

      if (data.success) {
        ToastModule.authToasts.passwordChangeSuccess();
        return null;
      } else {
        const errorMessage = data.error?.message || "Password change failed";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Password change failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear error action
    clearError: (state) => {
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Update user data
    updateUser: (state, action: PayloadAction<PublicUser>) => {
      state.user = action.payload;
    },

    // Reset auth state (useful for testing or manual logout)
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;

        // Clear token from localStorage when auth check fails
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-token");
        }
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, setLoading, updateUser, resetAuth } =
  authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Export reducer
export default authSlice.reducer;
