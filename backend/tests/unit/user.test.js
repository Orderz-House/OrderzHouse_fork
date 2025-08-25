<<<<<<< HEAD
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
=======
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
>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
<<<<<<< HEAD
    it("should return 400 if required fields are missing", async () => {
      mockReq.body = { email: "test@test.com" };
      await register(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: false, 
        message: "All fields are required" 
      }));
=======
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
>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
    });

<<<<<<< HEAD
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
=======
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
>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
    });
  });

<<<<<<< HEAD




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
=======
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
>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
    });
  });

  describe("viewUsers", () => {
    it("should return all non-deleted users", async () => {
<<<<<<< HEAD
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
=======
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
>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
    });
  });

  describe("deleteUser", () => {
    it("should soft delete a user successfully", async () => {
      mockReq.params.id = "1";
<<<<<<< HEAD
      const mockDeletedUser = { id: 1, name: "Deleted User", is_deleted: true };
      pool.query.mockResolvedValue({ rows: [mockDeletedUser] });

=======
      const mockUser = { id: 1, name: "User 1", is_deleted: true };

      pool.query.mockResolvedValue({ rows: [mockUser] });

>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
      await deleteUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        "UPDATE Users SET is_deleted = TRUE WHERE id = $1 RETURNING *",
        ["1"]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
<<<<<<< HEAD
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "User deleted successfully",
      }));
=======
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
        user: mockUser,
      });
>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
    });

    it("should return 404 if user not found", async () => {
      mockReq.params.id = "999";
      pool.query.mockResolvedValue({ rows: [] });

      await deleteUser(mockReq, mockRes);
<<<<<<< HEAD

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
=======

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
>>>>>>> bc17ab4e29036e540891aa5be53fe89f1f21edcc
