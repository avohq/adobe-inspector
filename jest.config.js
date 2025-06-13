module.exports = {
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "src"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  verbose: true,
  testTimeout: 10000,
  setupFiles: ["./jest.setup.js"],
};
