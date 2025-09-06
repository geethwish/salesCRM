// Enhanced mock for UserModel with in-memory storage and basic query support
const { ObjectId } = require("./bson");

// In-memory user store
const mockUsers = new Map(); // key: id (string), value: user doc

function normalizeEmail(email) {
  return (email || "").toLowerCase();
}

function createMockUser(data = {}) {
  const id =
    (data._id && data._id.toString && data._id.toString()) ||
    new ObjectId().toString();
  const user = {
    _id: id,
    email: normalizeEmail(data.email) || "test@example.com",
    name: data.name || "Test User",
    password: data.password || "hashedpassword",
    role: data.role || "user",
    isActive: data.isActive !== undefined ? data.isActive : true,
    emailVerified:
      data.emailVerified !== undefined ? data.emailVerified : false,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    toObject: jest.fn().mockReturnValue({
      _id: id,
      email: normalizeEmail(data.email) || "test@example.com",
      name: data.name || "Test User",
      password: data.password || "hashedpassword",
      role: data.role || "user",
      isActive: data.isActive !== undefined ? data.isActive : true,
      emailVerified:
        data.emailVerified !== undefined ? data.emailVerified : false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    }),
    save: jest.fn().mockImplementation(function () {
      mockUsers.set(this._id.toString(), this);
      return Promise.resolve(this);
    }),
  };
  return user;
}

// Constructor
const UserModel = jest.fn().mockImplementation((data) => {
  return createMockUser(data);
});

// Static helpers
UserModel.find = jest.fn().mockImplementation(async (query = {}) => {
  // Very basic support: return all users
  return Array.from(mockUsers.values());
});

UserModel.findOne = jest.fn().mockImplementation((query = {}) => {
  let found = null;
  if (query.email) {
    const email = normalizeEmail(query.email);
    for (const user of mockUsers.values()) {
      if (normalizeEmail(user.email) === email) {
        found = user;
        break;
      }
    }
  }
  // Support chaining with .select('+password') used in login flow
  const result = found || null;
  result && (result.select = jest.fn().mockResolvedValue(result));
  return result;
});

UserModel.findById = jest.fn().mockImplementation(async (id) => {
  const key = id && id.toString ? id.toString() : id;
  return mockUsers.get(key) || null;
});

UserModel.findByIdAndUpdate = jest
  .fn()
  .mockImplementation(async (id, update) => {
    const key = id && id.toString ? id.toString() : id;
    const user = mockUsers.get(key);
    if (!user) return null;
    Object.assign(user, update, { updatedAt: new Date() });
    mockUsers.set(key, user);
    return user;
  });

UserModel.create = jest.fn().mockImplementation(async (data) => {
  const user = createMockUser(data);
  mockUsers.set(user._id.toString(), user);
  return user;
});

UserModel.deleteMany = jest.fn().mockImplementation(async () => {
  const count = mockUsers.size;
  mockUsers.clear();
  return { deletedCount: count };
});

UserModel.countDocuments = jest
  .fn()
  .mockImplementation(async () => mockUsers.size);

module.exports = UserModel;
module.exports.default = UserModel;
module.exports.IUser = {};
