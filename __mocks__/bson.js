// Mock for BSON module
const ObjectId = jest.fn().mockImplementation((id) => ({
  toString: () => id || '507f1f77bcf86cd799439011',
  toHexString: () => id || '507f1f77bcf86cd799439011',
  equals: jest.fn(),
}));

ObjectId.isValid = jest.fn().mockReturnValue(true);

module.exports = {
  ObjectId,
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
  BSONError: Error,
  BSONType: {},
  calculateObjectSize: jest.fn(),
  deserialize: jest.fn(),
  serialize: jest.fn(),
};
