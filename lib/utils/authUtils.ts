/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Authentication utility functions for Redux-based auth system
 *
 * These utilities provide helper functions for authentication-related operations
 * that work with the Redux store and redux-persist.
 */

import { RootState } from "@/lib/store";
import { PublicUser } from "@/lib/types/auth";

/**
 * Check if user has a specific role
 */
export function hasRole(user: PublicUser | null, role: string): boolean {
  return user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: PublicUser | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}

/**
 * Get user's display name
 */
export function getUserDisplayName(user: PublicUser | null): string {
  if (!user) return "Guest";
  return user.name || user.email || "User";
}

/**
 * Check if user is authenticated from Redux state
 */
export function isUserAuthenticated(state: RootState): boolean {
  return state.auth.isAuthenticated && !!state.auth.user && !!state.auth.token;
}

/**
 * Get auth token from Redux state
 */
export function getAuthToken(state: RootState): string | null {
  return state.auth.token;
}

/**
 * Check if auth is loading
 */
export function isAuthLoading(state: RootState): boolean {
  return state.auth.isLoading;
}

/**
 * Get auth error message
 */
export function getAuthError(state: RootState): string | null {
  return state.auth.error;
}

/**
 * Get current user from Redux state
 */
export function getCurrentUser(state: RootState): PublicUser | null {
  return state.auth.user;
}

/**
 * Create authorization header for API requests
 */
export function createAuthHeader(token: string | null): Record<string, string> {
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Check if token exists in localStorage (for SSR compatibility)
 * This is mainly used during rehydration
 */
export function hasStoredToken(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const persistedAuth = localStorage.getItem("persist:auth");
    if (!persistedAuth) return false;

    const authState = JSON.parse(persistedAuth);
    return authState.token && authState.token !== "null";
  } catch (error) {
    console.error("Error checking stored token:", error);
    return false;
  }
}

/**
 * Clear persisted auth data (useful for logout or error recovery)
 */
export function clearPersistedAuth(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("persist:auth");
  } catch (error) {
    console.error("Error clearing persisted auth:", error);
  }
}

/**
 * Validate user object structure
 */
export function isValidUser(user: any): user is PublicUser {
  return (
    user &&
    typeof user === "object" &&
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string"
  );
}

/**
 * Format user role for display
 */
export function formatUserRole(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":
      return "Administrator";
    case "manager":
      return "Manager";
    case "user":
      return "User";
    default:
      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(user: PublicUser | null): boolean {
  return hasRole(user, "admin");
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(user: PublicUser | null): boolean {
  return hasAnyRole(user, ["admin", "manager"]);
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(user: PublicUser | null): string {
  if (!user || !user.name) return "?";

  const names = user.name.trim().split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}
