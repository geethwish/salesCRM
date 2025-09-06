const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Path to your Next.js app
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom", // Use jsdom for React component tests
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // Fix path mapping for project root
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  // Use different environments for different test types
  projects: [
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/**/*.(test|spec).(ts|tsx)"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__tests__/**/*.api.(test|spec).(ts|tsx)"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
  ],
};

module.exports = createJestConfig(customJestConfig);
