import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface for TypeScript
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toAPIResponse(): Omit<IUser, 'password' | '__v'>;
}

// User schema definition
const UserSchema = new Schema<IUser>(
  {
    // Email (unique identifier)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
      index: true,
    },
    
    // Hashed password
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    
    // User's full name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      minlength: [1, 'Name is required'],
    },
    
    // User role
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Role must be either admin or user',
      },
      default: 'user',
      index: true,
    },
    
    // Account status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    // Email verification status
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    // Enable automatic timestamps
    timestamps: true,
    
    // Transform output to exclude sensitive data
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    
    toObject: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true }); // Unique email index
UserSchema.index({ role: 1, isActive: 1 }); // Filter active users by role
UserSchema.index({ createdAt: -1 }); // Sort by creation date

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to return API-safe user object
UserSchema.methods.toAPIResponse = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  userObject.id = this._id.toString();
  delete userObject._id;
  return userObject;
};

// Static method to find user by email (including password for authentication)
UserSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// Static method to find active users
UserSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
UserSchema.statics.findByRole = function(role: 'admin' | 'user') {
  return this.find({ role, isActive: true });
};

// Pre-remove middleware to handle cascading deletes
UserSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Remove all orders associated with this user
    const Order = mongoose.model('Order');
    await Order.deleteMany({ userId: this._id });
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Virtual for user's full profile
UserSchema.virtual('profile').get(function() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    role: this.role,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

// Create and export the model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
