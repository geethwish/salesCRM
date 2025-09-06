// Mock for OrderModel
import { ObjectId } from "./bson";

// Mock order document
const createMockOrder = (data = {}) => ({
  _id: new ObjectId(),
  customer: data.customer || "Test Customer",
  category: data.category || "Electronics",
  date: data.date || "2025-09-01",
  source: data.source || "online",
  geo: data.geo || "Test Location",
  amount: data.amount || 100.0,
  status: data.status || "pending",
  userId: data.userId || new ObjectId(),
  createdAt: data.createdAt || new Date(),
  updatedAt: data.updatedAt || new Date(),
  toObject: jest.fn().mockReturnValue({
    _id: new ObjectId(),
    customer: data.customer || "Test Customer",
    category: data.category || "Electronics",
    date: data.date || "2025-09-01",
    source: data.source || "online",
    geo: data.geo || "Test Location",
    amount: data.amount || 100.0,
    status: data.status || "pending",
    userId: data.userId || new ObjectId(),
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }),
  save: jest.fn().mockResolvedValue(this),
});

// Mock OrderModel constructor
const OrderModel = jest.fn().mockImplementation((data) => {
  const order = createMockOrder(data);
  return order;
});

// Add static methods
OrderModel.find = jest.fn().mockResolvedValue([]);
OrderModel.findOne = jest.fn().mockResolvedValue(null);
OrderModel.findById = jest.fn().mockResolvedValue(null);
OrderModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
OrderModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);
OrderModel.create = jest.fn().mockImplementation((data) => {
  const order = createMockOrder(data);
  return Promise.resolve(order);
});
OrderModel.insertMany = jest.fn().mockResolvedValue([]);
OrderModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
OrderModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 0 });
OrderModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
OrderModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
OrderModel.countDocuments = jest.fn().mockResolvedValue(0);
OrderModel.aggregate = jest.fn().mockResolvedValue([]);

// Export as default
module.exports = OrderModel;
module.exports.default = OrderModel;

// Export IOrder interface mock (for TypeScript)
module.exports.IOrder = {};
