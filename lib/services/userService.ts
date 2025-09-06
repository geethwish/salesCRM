import mongoose from "mongoose";
import {
  User,
  PublicUser,
  LoginRequest,
  RegisterRequest,
  UpdateProfile,
  ChangePassword,
  UserSchema,
  PublicUserSchema,
} from "@/lib/types/auth";
import {
  hashPassword,
  verifyPassword,
  sanitizeUser,
  validatePasswordStrength,
} from "@/lib/utils/auth";
import { ERROR_MESSAGES } from "@/lib/constants";
import { connectToDatabase } from "@/lib/database/connection";
import { withDatabase, handleDatabaseError } from "@/lib/database/utils";
import UserModel, { IUser } from "@/lib/models/User";

// MongoDB-based user storage
class UserStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectToDatabase();
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
    }
  }

  async create(userData: Omit<User, "id">): Promise<User> {
    return withDatabase(async () => {
      try {
        // Check if email already exists
        const existingUser = await UserModel.findOne({
          email: userData.email.toLowerCase(),
        });
        if (existingUser) {
          throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
        }

        // Create new user document
        const userDoc = new UserModel({
          email: userData.email.toLowerCase(),
          password: userData.password, // Will be hashed by pre-save middleware
          name: userData.name,
          role: userData.role,
          isActive: userData.isActive,
          emailVerified: userData.emailVerified,
        });

        const savedUser = await userDoc.save();
        return this.convertToUser(savedUser);
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return withDatabase(async () => {
      try {
        const user = await UserModel.findById(new mongoose.Types.ObjectId(id));
        return user ? this.convertToUser(user) : null;
      } catch (error) {
        console.error("Error finding user by ID:", error);
        return null;
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return withDatabase(async () => {
      try {
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        return user ? this.convertToUser(user) : null;
      } catch (error) {
        console.error("Error finding user by email:", error);
        return null;
      }
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return withDatabase(async () => {
      try {
        const user = await UserModel.findOne({
          email: email.toLowerCase(),
        }).select("+password");
        return user ? this.convertToUser(user) : null;
      } catch (error) {
        console.error("Error finding user by email with password:", error);
        return null;
      }
    });
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    return withDatabase(async () => {
      try {
        // If email is being updated, check if it already exists
        if (updates.email) {
          const existingUser = await UserModel.findOne({
            email: updates.email.toLowerCase(),
            _id: { $ne: new mongoose.Types.ObjectId(id) },
          });
          if (existingUser) {
            throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
          }
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
          new mongoose.Types.ObjectId(id),
          { ...updates, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        return updatedUser ? this.convertToUser(updatedUser) : null;
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  async delete(id: string): Promise<boolean> {
    return withDatabase(async () => {
      try {
        const result = await UserModel.deleteOne({
          _id: new mongoose.Types.ObjectId(id),
        });
        return result.deletedCount > 0;
      } catch (error) {
        console.error("Error deleting user:", error);
        return false;
      }
    });
  }

  async list(): Promise<User[]> {
    return withDatabase(async () => {
      try {
        const users = await UserModel.find({});
        return users.map((user) => this.convertToUser(user));
      } catch (error) {
        console.error("Error listing users:", error);
        return [];
      }
    });
  }

  async clear(): Promise<void> {
    return withDatabase(async () => {
      try {
        await UserModel.deleteMany({});
      } catch (error) {
        console.error("Error clearing users:", error);
      }
    });
  }

  // Helper method to convert MongoDB document to User interface
  private convertToUser(userDoc: IUser): User {
    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      password: userDoc.password,
      name: userDoc.name,
      role: userDoc.role,
      isActive: userDoc.isActive,
      emailVerified: userDoc.emailVerified,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }
}

// Create singleton instance
const userStorage = new UserStorage();

/**
 * User Service Class
 */
class UserService {
  /**
   * Register a new user
   */
  async registerUser(userData: RegisterRequest): Promise<PublicUser> {
    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(", "));
      }

      // Check if user already exists
      const existingUser = await userStorage.findByEmail(userData.email);
      if (existingUser) {
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user object
      const user: User = {
        id: uuidv4(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        role: "user", // Default role
        isActive: true,
        emailVerified: false, // Would be false in production until email verification
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate user data
      const validatedUser = UserSchema.parse(user);

      // Save user (exclude id since it will be generated by MongoDB)
      const { id, ...userDataWithoutId } = validatedUser;
      const savedUser = await userStorage.create(userDataWithoutId);

      // Return sanitized user data
      return sanitizeUser(savedUser);
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(credentials: LoginRequest): Promise<PublicUser> {
    try {
      // Find user by email (including password for verification)
      const user = await userStorage.findByEmailWithPassword(credentials.email);
      if (!user) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error(ERROR_MESSAGES.ACCOUNT_DISABLED);
      }

      // Verify password using the User model's comparePassword method
      const userDoc = await UserModel.findOne({
        email: credentials.email.toLowerCase(),
      }).select("+password");
      if (!userDoc) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await userDoc.comparePassword(
        credentials.password
      );
      if (!isPasswordValid) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Update last login time
      await userStorage.update(user.id, { lastLogin: new Date() });

      // Return sanitized user data
      return sanitizeUser(user);
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<PublicUser | null> {
    try {
      const user = await userStorage.findById(id);
      return user ? sanitizeUser(user) : null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<PublicUser | null> {
    try {
      const user = await userStorage.findByEmail(email);
      return user ? sanitizeUser(user) : null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: UpdateProfile
  ): Promise<PublicUser> {
    try {
      const user = await userStorage.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Update user
      const updatedUser = await userStorage.update(userId, updates);
      if (!updatedUser) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      return sanitizeUser(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    passwordData: ChangePassword
  ): Promise<void> {
    try {
      const user = await userStorage.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(
        passwordData.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error(ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(
        passwordData.newPassword
      );
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(", "));
      }

      // Hash new password
      const hashedPassword = await hashPassword(passwordData.newPassword);

      // Update password
      await userStorage.update(userId, { password: hashedPassword });
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      const user = await userStorage.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await userStorage.update(userId, { isActive: false });
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<PublicUser[]> {
    try {
      const users = await userStorage.list();
      return users.map((user) => sanitizeUser(user));
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  /**
   * Clear all users (for testing)
   */
  async clearAllUsers(): Promise<void> {
    await userStorage.clear();
  }
}

// Export singleton instance
export const userService = new UserService();
