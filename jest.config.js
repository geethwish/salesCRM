import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Path to your Next.js app
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^bson$": "<rootDir>/__mocks__/bson.js",
    "^mongodb$": "<rootDir>/__mocks__/mongodb.js",
    "^mongoose$": "<rootDir>/__mocks__/mongoose.js",
    "^uuid$": "<rootDir>/__mocks__/uuid.js",
    "^@/lib/models/User$": "<rootDir>/__mocks__/UserModel.js",
    "^@/lib/models/Order$": "<rootDir>/__mocks__/OrderModel.js",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testMatch: [
    "**/__tests__/**/*.test.{js,jsx,ts,tsx}",
    "**/?(*.)+(spec|test).{js,jsx,ts,tsx}",
  ],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!jest.setup.js",
  ],
};

export default createJestConfig(customJestConfig);
