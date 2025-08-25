const { register, login, viewUsers, deleteUser, editUser, createPortfolio, editPortfolioFreelancer } = require("../../controller/user");
const pool = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../models/db", () => ({
  query: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("Users Controller - Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = { body: {}, params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should return 400 if required fields are missing", async () => {
      mockReq.body = { email: "test@test.com" };
      await register(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: false, 
        message: "All fields are required" 
      }));
    });

    it("should register user successfully", async () => {
      mockReq.body = {
        role_id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "test@test.com",
        password: "password123",
        phone_number: "1234567890",
        country: "USA",
        username: "johndoe",
      };

      bcrypt.hash.mockResolvedValue("hashedPassword");
      pool.query.mockResolvedValue({ rows: [{ id: 1, ...mockReq.body, password: "hashedPassword" }] });

      await register(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", expect.any(Number));
      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: true, 
        message: "User registered successfully" 
      }));
    });
  });





  describe("login", () => {
    it("should login successfully", async () => {
      const mockUser = {
        id: 1,
        role_id: 2,
        email: "test@test.com",
        password: "hashedPassword",
      };
      mockReq.body = { email: "test@test.com", password: "password123" };

      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockImplementation((pass, hash, callback) => callback(null, true));
      jwt.sign.mockReturnValue("mockToken");

      await login(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith("SELECT * FROM users WHERE email = $1", ["test@test.com"]);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, role: 2 },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: true, 
        token: "mockToken",
        message: "Valid login credentials" 
      }));
    });

    it("should return 403 for invalid credentials (no user found)", async () => {
      mockReq.body = { email: "nonexistent@test.com", password: "wrongpass" };
      pool.query.mockResolvedValue({ rows: [] });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "The email desn't exist or the password you've entered is incorrect",
      }));
    });

    it("should return 403 for incorrect password", async () => {
      const mockUser = {
        id: 1,
        role_id: 2,
        email: "test@test.com",
        password: "hashedPassword",
      };
      mockReq.body = { email: "test@test.com", password: "wrongpass" };

      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockImplementation((pass, hash, callback) => callback(null, false));

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "The email desn't exist or the password you've entered is incorrect",
      }));
    });

    it("should handle bcrypt compare errors", async () => {
      const mockUser = {
        id: 1,
        role_id: 2,
        email: "test@test.com",
        password: "hashedPassword",
      };
      mockReq.body = { email: "test@test.com", password: "password123" };

      pool.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockImplementation((pass, hash, callback) => callback(new Error("Bcrypt error"), null));

      await login(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe("viewUsers", () => {
    it("should return all non-deleted users", async () => {
      const mockUsers = [{ id: 1, name: "User1" }, { id: 2, name: "User2" }];
      pool.query.mockResolvedValue({ rows: mockUsers });

      await viewUsers(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith("SELECT * FROM Users WHERE is_deleted = FALSE");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        users: mockUsers
      }));
    });

    it("should handle database errors", async () => {
      pool.query.mockRejectedValue(new Error("Database error"));

      await viewUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error fetching users",
      }));
    });
  });

  describe("deleteUser", () => {
    it("should soft delete a user successfully", async () => {
      mockReq.params.id = "1";
      const mockDeletedUser = { id: 1, name: "Deleted User", is_deleted: true };
      pool.query.mockResolvedValue({ rows: [mockDeletedUser] });

      await deleteUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE Users SET is_deleted = TRUE WHERE id = $1 RETURNING *",
        ["1"]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "User deleted successfully",
      }));
    });

    it("should return 404 if user not found", async () => {
      mockReq.params.id = "999";
      pool.query.mockResolvedValue({ rows: [] });

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "User not found",
      }));
    });

    it("should handle database errors", async () => {
      mockReq.params.id = "1";
      pool.query.mockRejectedValue(new Error("Database error"));

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error deleting user",
      }));
    });
  });

  describe("editUser", () => {
    it("should update user successfully", async () => {
      mockReq.params.userId = "1";
      mockReq.body = {
        first_name: "Updated",
        last_name: "Name",
        email: "updated@test.com"
      };
      const mockUpdatedUser = { id: 1, ...mockReq.body };
      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });

      await editUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "User updated successfully",
      }));
    });

    it("should return 404 if user not found", async () => {
      mockReq.params.userId = "999";
      mockReq.body = { first_name: "Updated" };
      pool.query.mockResolvedValue({ rows: [] });

      await editUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "User not found or deleted",
      }));
    });

    it("should handle database errors", async () => {
      mockReq.params.userId = "1";
      mockReq.body = { first_name: "Updated" };
      pool.query.mockRejectedValue(new Error("Database error"));

      await editUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error updating user",
      }));
    });
  });

  describe("createPortfolio", () => {
    it("should return 400 if required fields are missing", async () => {
      mockReq.body = { title: "Portfolio Title" };
      await createPortfolio(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "freelancer_id and title are required",
      }));
    });

    it("should create portfolio successfully", async () => {
      mockReq.body = {
        freelancer_id: 1,
        title: "My Portfolio",
        description: "A great portfolio",
        skills: ["JavaScript", "Node.js"],
        hourly_rate: 50,
        work_url: "https://example.com"
      };
      const mockPortfolio = { id: 1, ...mockReq.body };
      pool.query.mockResolvedValue({ rows: [mockPortfolio] });

      await createPortfolio(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Portfolio created successfully",
      }));
    });

    it("should handle database errors", async () => {
      mockReq.body = {
        freelancer_id: 1,
        title: "My Portfolio"
      };
      pool.query.mockRejectedValue(new Error("Database error"));

      await createPortfolio(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Error creating portfolio",
      }));
    });
  });

  describe("editPortfolioFreelancer", () => {
    it("should update portfolio successfully", async () => {
      mockReq.params.userId = "1";
      mockReq.body = {
        title: "Updated Portfolio",
        description: "Updated description",
        hourly_rate: 60
      };
      const mockUpdatedPortfolio = { id: 1, freelancer_id: 1, ...mockReq.body };
      pool.query.mockResolvedValue({ rows: [mockUpdatedPortfolio] });

      await editPortfolioFreelancer(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Profile updated successfully",
      }));
    });

    it("should return 404 if portfolio not found", async () => {
      mockReq.params.userId = "999";
      mockReq.body = { title: "Updated" };
      pool.query.mockResolvedValue({ rows: [] });

      await editPortfolioFreelancer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "Portfolio not found for this freelancer",
      }));
    })
        it("should handle database errors", async () => {
          mockReq.params.userId = "1";
          mockReq.body = { title: "Updated" };
          pool.query.mockRejectedValue(new Error("Database error"));
    
          await editPortfolioFreelancer(mockReq, mockRes);
    
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Error updating profile",
          }));
        });
      });
    });