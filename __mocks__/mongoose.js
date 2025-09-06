// Mock for Mongoose module
const { ObjectId } = require("./bson");

const mockSchema = jest.fn().mockImplementation(() => ({
  add: jest.fn(),
  index: jest.fn(),
  pre: jest.fn(),
  post: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  methods: {},
  statics: {},
  virtual: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

const mockModel = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  }),
  findByIdAndDelete: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  }),
  create: jest.fn().mockResolvedValue({
    _id: "507f1f77bcf86cd799439011",
    toObject: jest.fn().mockReturnValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
    }),
  }),
  insertMany: jest.fn().mockResolvedValue([]),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
  countDocuments: jest.fn().mockResolvedValue(0),
  aggregate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  }),
};

const mongoose = {
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
  },
  Schema: mockSchema,
  model: jest.fn().mockReturnValue(mockModel),
  models: {},
  Types: {
    ObjectId,
  },
  isValidObjectId: jest.fn().mockReturnValue(true),
  Error: {
    MongooseServerSelectionError: class MongooseServerSelectionError extends Error {},
    MongoNetworkError: class MongoNetworkError extends Error {},
    ValidationError: class ValidationError extends Error {},
    CastError: class CastError extends Error {},
    DocumentNotFoundError: class DocumentNotFoundError extends Error {},
  },
};

// Set up Schema types
mockSchema.Types = {
  ObjectId: jest.fn(),
  String: String,
  Number: Number,
  Date: Date,
  Boolean: Boolean,
  Array: Array,
  Mixed: jest.fn(),
};

module.exports = mongoose;
module.exports.default = mongoose;
