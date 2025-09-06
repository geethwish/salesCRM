/**
 * Custom auth hook for Redux-based authentication
 *
 * This hook provides a similar interface to the previous useAuth hook
 * but uses Redux for state management instead of React Context.
 * This makes migration easier for existing components.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  changeUserPassword,
  clearError,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
} from "@/lib/store/slices/authSlice";
import {
  LoginRequest,
  RegisterRequest,
  UpdateProfile,
  ChangePassword,
  UseAuthReturn,
} from "@/lib/types/auth";

/**
 * Custom hook that provides authentication functionality
 * Compatible with the previous useAuth hook interface
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Select auth state from Redux store
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const result = await dispatch(loginUser(credentials));

      if (loginUser.fulfilled.match(result)) {
        // Redirect to dashboard on successful login
        router.push("/dashboard");
      }
      // Error is already handled in the thunk (toast notification and Redux state)
      // No need to throw here as the error is stored in Redux state
    },
    [dispatch, router]
  );

  // Register function
  const register = useCallback(
    async (userData: RegisterRequest): Promise<void> => {
      const result = await dispatch(registerUser(userData));

      if (registerUser.fulfilled.match(result)) {
        // Redirect to dashboard on successful registration
        router.push("/dashboard");
      }
      // Error is already handled in the thunk (toast notification and Redux state)
      // No need to throw here as the error is stored in Redux state
    },
    [dispatch, router]
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    await dispatch(logoutUser());
    // Redirect to home page after logout
    router.push("/");
  }, [dispatch, router]);

  // Update profile function
  const updateProfile = useCallback(
    async (data: UpdateProfile): Promise<void> => {
      const result = await dispatch(updateUserProfile(data));

      if (!updateUserProfile.fulfilled.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  // Change password function
  const changePassword = useCallback(
    async (data: ChangePassword): Promise<void> => {
      const result = await dispatch(changeUserPassword(data));

      if (!changeUserPassword.fulfilled.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  // Clear error function
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError: clearAuthError,
    updateProfile,
    changePassword,
  };
}

export default useAuth;
