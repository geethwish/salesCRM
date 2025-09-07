/**
 * Unit tests for RegisterForm component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/lib/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/lib/hooks/useAuth');
const mockUseAuth = jest.mocked(useAuth);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
  },
  AnimatePresence: 'div',
}));

describe('RegisterForm', () => {
  const mockRegister = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
      user: null,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call register API on form submission', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const nameInput = screen.getByPlaceholderText(/enter your full name/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.click(termsCheckbox);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      // Check that validation errors appear
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
        expect(screen.getByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
      });

      // Verify register was not called
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByPlaceholderText(/create a password/i);
      await user.type(passwordInput, '123');
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        // Look for the enhanced error message specifically (with alert icon)
        const errorMessages = screen.getAllByText(/password must be at least 8 characters long/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should show validation error for password without required characters', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByPlaceholderText(/create a password/i);
      await user.type(passwordInput, 'password'); // No uppercase or number
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one lowercase letter, one uppercase letter, and one number/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByPlaceholderText(/create a password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'DifferentPassword123!');
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByPlaceholderText(/enter your full name/i);
      await user.type(nameInput, 'A');
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters long/i)).toBeInTheDocument();
      });
    });
  });
});
