// Mock for UUID module
const v4 = jest.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

module.exports = {
  v4,
  v1: jest.fn(),
  v3: jest.fn(),
  v5: jest.fn(),
  validate: jest.fn().mockReturnValue(true),
  version: jest.fn().mockReturnValue(4),
};
