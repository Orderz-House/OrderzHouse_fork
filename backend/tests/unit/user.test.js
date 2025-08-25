const { pool } = require("../../models/db");
const {
  register,
  login,
  viewUsers,
  deleteUser,
  editUser,
  getAllFreelancers,
  deleteFreelancerById,
} = require("../../controller/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mock dependencies
jest.mock("../../models/db", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      headers: {},
      connection: { remoteAddress: "127.0.0.1" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: 1,
        role_id: 2,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        phone_number: "1234567890",
        country: "USA",
        username: "johndoe",
      };

      mockReq.body = {
        role_id: 2,
        first_name: "John",
        last_name: "Doe",
        email: "JOHN@EXAMPLE.COM",
        password: "password123",
        phone_number: "1234567890",
        country: "USA",
        username: "johndoe",
      };

      bcrypt.hash.mockResolvedValue("hashedPassword123");
      pool.query.mockResolvedValue({ rows: [mockUser] });

      await register(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [2, "John", "Doe", "john@example.com", "hashedPassword123", "1234567890", "USA", "johndoe"]
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "User registered successfully",
        user: mockUser,
      });
    });

    it("should return 400 if required fields are missing", async () => {
      mockReq.body = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    it("should return 409 if email already exists", async () => {
      mockReq.body = {
        role_id: 2,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "password123",
        phone_number: "1234567890",
        country: "USA",
        username: "johndoe",
      };

      const error = new Error("Duplicate email");
      error.constraint = "users_email_key";

      bcrypt.hash.mockResolvedValue("hashedPassword123");
      pool.query.mockRejectedValue(error);

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Email already exists",
      });
    });
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      const mockUser = {
        id: 1,
        role_id: 3,
        email: "john@example.com",
        password: "hashedPassword123",
      };

      mockReq.body = {
        email: "JOHN@EXAMPLE.COM",
        password: "password123",
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken123");

      await login(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = $1",
        ["john@example.com"]
      );
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword123");
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, role: 3 },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        token: "mockToken123",
        success: true,
        message: "Valid login credentials",
        userId: 1,
        role: 3,
        userInfo: mockUser,
      });
    });

    it("should return 403 for incorrect password", async () => {
      const mockUser = {
        id: 1,
        role_id: 3,
        email: "john@example.com",
        password: "hashedPassword123",
      };

      mockReq.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "The email desn't exist or the password you've entered is incorrect",
      });
    });

    it("should return 403 for non-existent email", async () => {
      mockReq.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      pool.query.mockResolvedValue({ rows: [] });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "The email desn't exist or the password you've entered is incorrect",
      });
    });
  });

  describe("viewUsers", () => {
    it("should return all non-deleted users", async () => {
      const mockUsers = [
        { id: 1, name: "User 1", is_deleted: false },
        { id: 2, name: "User 2", is_deleted: false },
      ];

      pool.query.mockResolvedValue({ rows: mockUsers });

      await viewUsers(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM Users WHERE is_deleted = FALSE"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        users: mockUsers,
      });
    });
  });

  describe("deleteUser", () => {
    it("should soft delete a user successfully", async () => {
      mockReq.params.id = "1";
      const mockUser = { id: 1, name: "User 1", is_deleted: true };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      await deleteUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE Users SET is_deleted = TRUE WHERE id = $1 RETURNING *",
        ["1"]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
        user: mockUser,
      });
    });

    it("should return 404 if user not found", async () => {
      mockReq.params.id = "999";
      pool.query.mockResolvedValue({ rows: [] });

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });
  });

  describe("editUser", () => {
    it("should update user successfully", async () => {
      mockReq.params.userId = "1";
      mockReq.body = {
        first_name: "Updated",
        last_name: "Name",
        email: "updated@example.com",
      };

      const mockUpdatedUser = { id: 1, first_name: "Updated", last_name: "Name", email: "updated@example.com" };
      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });

      await editUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ["Updated", "Name", "updated@example.com", undefined, undefined, undefined, undefined, "1"]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully",
        user: mockUpdatedUser,
      });
    });
  });

  describe("getAllFreelancers", () => {
    it("should return all freelancers with active filter", async () => {
      mockReq.body = { filter: "active" };
      const mockFreelancers = [
        { id: 1, name: "Freelancer 1", is_deleted: false },
        { id: 2, name: "Freelancer 2", is_deleted: false },
      ];

      pool.query.mockResolvedValue({ rows: mockFreelancers });

      await getAllFreelancers(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("users.is_deleted = FALSE"));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        freelancers: mockFreelancers,
      });
    });

    it("should return 400 for invalid filter", async () => {
      mockReq.body = { filter: "invalid" };

      await getAllFreelancers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid filter value. Must be 'active', 'deactivated', or 'all'.",
      });
    });
  });

  describe("deleteFreelancerById", () => {
    it("should deactivate a freelancer successfully", async () => {
      mockReq.params.userId = "1";
      const mockFreelancer = { id: 1, is_deleted: true, role_id: 3 };

      pool.query.mockResolvedValue({ rows: [mockFreelancer] });

      await deleteFreelancerById(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE Users"),
        ["1"]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Freelancer deactivated successfully",
        freelancer: mockFreelancer,
      });
    });

    it("should return 404 if freelancer not found", async () => {
      mockReq.params.userId = "999";
      pool.query.mockResolvedValue({ rows: [] });

      await deleteFreelancerById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Freelancer not found",
      });
    });
  });
});