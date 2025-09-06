// Mock for MongoDB module
import { ObjectId } from "./bson";

const mockCollection = {
  insertOne: jest.fn(),
  insertMany: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn().mockReturnValue({
    toArray: jest.fn(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  }),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  createIndex: jest.fn(),
  dropIndex: jest.fn(),
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
  createCollection: jest.fn(),
  dropCollection: jest.fn(),
  listCollections: jest.fn(),
};

const mockClient = {
  connect: jest.fn(),
  close: jest.fn(),
  db: jest.fn().mockReturnValue(mockDb),
  isConnected: jest.fn().mockReturnValue(true),
};

const MongoClient = {
  connect: jest.fn().mockResolvedValue(mockClient),
};

module.exports = {
  MongoClient,
  ObjectId,
  MongoError: Error,
  MongoServerError: Error,
  MongoNetworkError: Error,
  MongoTimeoutError: Error,
  Binary: jest.fn(),
  Code: jest.fn(),
  DBRef: jest.fn(),
  Decimal128: jest.fn(),
  Double: jest.fn(),
  Int32: jest.fn(),
  Long: jest.fn(),
  MaxKey: jest.fn(),
  MinKey: jest.fn(),
  Timestamp: jest.fn(),
  UUID: jest.fn(),
};
