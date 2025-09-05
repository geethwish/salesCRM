import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  PublicUser, 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfile, 
  ChangePassword,
  UserSchema,
  PublicUserSchema 
} from '@/lib/types/auth';
import { 
  hashPassword, 
  verifyPassword, 
  sanitizeUser, 
  validatePasswordStrength 
} from '@/lib/utils/auth';
import { ERROR_MESSAGES } from '@/lib/constants';

// In-memory user storage (replace with database in production)
class UserStorage {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId mapping

  // Initialize with a default admin user for testing
  constructor() {
    this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    const adminUser: User = {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@salescrm.com',
      password: await hashPassword('Admin123!'),
      role: 'admin',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const testUser: User = {
      id: uuidv4(),
      name: 'Test User',
      email: 'user@salescrm.com',
      password: await hashPassword('User123!'),
      role: 'user',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(testUser.id, testUser);
    this.emailIndex.set(adminUser.email, adminUser.id);
    this.emailIndex.set(testUser.email, testUser.id);
  }

  async create(user: User): Promise<User> {
    // Check if email already exists
    if (this.emailIndex.has(user.email)) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) || null : null;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    // If email is being updated, update the email index
    if (updates.email && updates.email !== user.email) {
      // Check if new email already exists
      if (this.emailIndex.has(updates.email)) {
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      
      // Remove old email from index and add new one
      this.emailIndex.delete(user.email);
      this.emailIndex.set(updates.email, id);
    }

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }

    this.users.delete(id);
    this.emailIndex.delete(user.email);
    return true;
  }

  async list(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async clear(): Promise<void> {
    this.users.clear();
    this.emailIndex.clear();
    await this.seedDefaultUsers();
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
        throw new Error(passwordValidation.errors.join(', '));
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
        role: 'user', // Default role
        isActive: true,
        emailVerified: false, // Would be false in production until email verification
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate user data
      const validatedUser = UserSchema.parse(user);

      // Save user
      const savedUser = await userStorage.create(validatedUser);

      // Return sanitized user data
      return sanitizeUser(savedUser);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(credentials: LoginRequest): Promise<PublicUser> {
    try {
      // Find user by email
      const user = await userStorage.findByEmail(credentials.email);
      if (!user) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error(ERROR_MESSAGES.ACCOUNT_DISABLED);
      }

      // Verify password
      const isPasswordValid = await verifyPassword(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Update last login time
      await userStorage.update(user.id, { lastLogin: new Date() });

      // Return sanitized user data
      return sanitizeUser(user);
    } catch (error) {
      console.error('Error logging in user:', error);
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
      console.error('Error getting user by ID:', error);
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
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: UpdateProfile): Promise<PublicUser> {
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
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwordData: ChangePassword): Promise<void> {
    try {
      const user = await userStorage.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(passwordData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error(ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Hash new password
      const hashedPassword = await hashPassword(passwordData.newPassword);

      // Update password
      await userStorage.update(userId, { password: hashedPassword });
    } catch (error) {
      console.error('Error changing password:', error);
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
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<PublicUser[]> {
    try {
      const users = await userStorage.list();
      return users.map(user => sanitizeUser(user));
    } catch (error) {
      console.error('Error getting all users:', error);
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
