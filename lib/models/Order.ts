import mongoose, { Schema, Document, Model } from "mongoose";
import {
  Order as OrderInterface,
  OrderCategory,
  OrderSource,
} from "@/lib/types/order";

// Extend the Order interface to include MongoDB document properties
export interface IOrder extends Omit<OrderInterface, "id">, Document {
  _id: mongoose.Types.ObjectId;
  id: string; // Virtual field for API compatibility
  userId: mongoose.Types.ObjectId; // Reference to the user who owns this order
  createdAt: Date;
  updatedAt: Date;
}

// Order schema definition
const OrderSchema = new Schema<IOrder>(
  {
    // User reference for data isolation
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Customer information
    customer: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
      minlength: [1, "Customer name is required"],
    },

    // Order category
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: Object.values(OrderCategory),
        message: "Invalid category. Must be one of: {VALUES}",
      },
      index: true,
    },

    // Order date (stored as string for API compatibility)
    date: {
      type: String,
      required: [true, "Order date is required"],
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Date must be in YYYY-MM-DD format",
      },
      index: true,
    },

    // Order source
    source: {
      type: String,
      required: [true, "Order source is required"],
      enum: {
        values: Object.values(OrderSource),
        message: "Invalid source. Must be one of: {VALUES}",
      },
      index: true,
    },

    // Geographic location
    geo: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location name cannot exceed 100 characters"],
      minlength: [1, "Location is required"],
      index: true,
    },

    // Order amount
    amount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: function (v: number) {
          return v === undefined || v >= 0;
        },
        message: "Amount must be positive",
      },
    },

    // Order status
    status: {
      type: String,
      enum: {
        values: ["pending", "processing", "shipped", "delivered", "cancelled"],
        message: "Invalid status. Must be one of: {VALUES}",
      },
      default: "pending",
      index: true,
    },
  },
  {
    // Enable automatic timestamps
    timestamps: true,

    // Transform output to match API expectations
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.userId; // Don't expose userId in API responses
        return ret;
      },
    },

    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual field for id (for API compatibility)
OrderSchema.virtual("id").get(function (this: IOrder) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
OrderSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.userId; // Don't expose userId in API responses
    return ret;
  },
});

// Compound indexes for performance
OrderSchema.index({ userId: 1, date: -1 }); // Most common query pattern
OrderSchema.index({ userId: 1, category: 1 }); // Filter by category
OrderSchema.index({ userId: 1, source: 1 }); // Filter by source
OrderSchema.index({ userId: 1, geo: 1 }); // Filter by location
OrderSchema.index({ userId: 1, status: 1 }); // Filter by status
OrderSchema.index({ userId: 1, createdAt: -1 }); // Sort by creation date
OrderSchema.index({ userId: 1, amount: -1 }); // Sort by amount

// Text index for search functionality
OrderSchema.index(
  {
    customer: "text",
    category: "text",
    source: "text",
    geo: "text",
  },
  {
    weights: {
      customer: 10,
      category: 5,
      source: 3,
      geo: 2,
    },
    name: "order_text_index",
  }
);

// Pre-save middleware for validation
OrderSchema.pre("save", function (next) {
  // Ensure amount is not negative
  if (this.amount !== undefined && this.amount < 0) {
    next(new Error("Amount cannot be negative"));
    return;
  }

  // Validate date format
  if (this.date && !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
    next(new Error("Date must be in YYYY-MM-DD format"));
    return;
  }

  next();
});

// Static methods for common queries
OrderSchema.statics.findByUserId = function (
  userId: string | mongoose.Types.ObjectId
) {
  return this.find({ userId });
};

OrderSchema.statics.findByUserIdAndCategory = function (
  userId: string | mongoose.Types.ObjectId,
  category: string
) {
  return this.find({ userId, category });
};

OrderSchema.statics.getStatsByUserId = function (
  userId: string | mongoose.Types.ObjectId
) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        averageAmount: { $avg: "$amount" },
      },
    },
  ]);
};

// Instance methods
OrderSchema.methods.toAPIResponse = function () {
  const obj = this.toObject();
  obj.id = this._id.toString();
  delete obj._id;
  delete obj.__v;
  delete obj.userId;
  return obj;
};

// Create and export the model
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
export { Order as OrderModel };
