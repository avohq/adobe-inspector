// Mock console methods to keep test output clean
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock turbine global
global.turbine = {
  getExtensionSettings: jest.fn().mockReturnValue({
    apiKey: "test-api-key",
    environment: "dev",
    appVersion: "1.0.0",
  }),
};
