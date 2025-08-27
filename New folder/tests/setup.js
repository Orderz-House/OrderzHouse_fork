// Kept for backward-compatibility if referenced elsewhere; active setup moved to setup.mjs
beforeAll(() => {
  // Suppress console.error during tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console methods
  console.error.mockRestore();
  console.warn.mockRestore();
});

// Mock the database globally for all tests
jest.mock("../models/db.js", () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }
}));

// Mock authorization middleware globally
jest.mock("../middleware/authorization.js", () => {
  return (permission) => (req, res, next) => {
    // Mock successful authorization
    next();
  };
});

// Mock authentication middleware globally
jest.mock("../middleware/authentication.js", () => ({
  authentication: (req, res, next) => {
    req.token = { userId: 1, role: 1 };
    next();
  },
  authSocket: (socket, next) => {
    socket.user = { userId: 1, role: 1 };
    next();
  }
}));

// Global test timeout
jest.setTimeout(10000);
