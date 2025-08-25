const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// استدعاء الملف اللي فيه الكونترولرز
const userController = require("../../controller/user"); // عدّل المسار حسب مكان الملف

// نعمل mock للـ db pool
jest.mock("../../models/db", () => {
  return {
    query: jest.fn()
  };
});
const pool = require("../../models/db");

// نحضّر app Express للاختبار
const app = express();
app.use(express.json());

// نربط الرَوتات اللي بدنا نختبرها
app.post("/register", userController.register);
app.post("/login", userController.login);
app.get("/users", userController.viewUsers);
app.delete("/users/:id", userController.deleteUser);
app.put("/users/:userId", userController.editUser);

describe("User Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("should register a user successfully", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: "test@test.com" }] });

      const res = await request(app)
        .post("/register")
        .send({
          role_id: 1,
          first_name: "Ali",
          last_name: "Test",
          email: "test@test.com",
          password: "123456",
          phone_number: "123456789",
          country: "JO",
          username: "aliTest"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe("test@test.com");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/register").send({
        email: "missing@test.com"
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /login", () => {
    it("should login successfully and return a token", async () => {
      const hashed = await bcrypt.hash("123456", 10);
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: "test@test.com", password: hashed, role_id: 2 }]
      });

      // Mock jwt.sign to avoid real token generation errors
      jest.spyOn(jwt, "sign").mockReturnValue("mocked_token");

      const res = await request(app).post("/login").send({
        email: "test@test.com",
        password: "123456"
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();

      jwt.sign.mockRestore();
    });

    it("should return 403 if email not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post("/login").send({
        email: "notfound@test.com",
        password: "wrong"
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 if password is incorrect", async () => {
      const hashed = await bcrypt.hash("correct", 10);
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: "test@test.com", password: hashed, role_id: 2 }]
      });

      const res = await request(app).post("/login").send({
        email: "test@test.com",
        password: "wrong"
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /users", () => {
    it("should return users list", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: "test@test.com" }]
      });

      const res = await request(app).get("/users");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users.length).toBe(1);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user successfully", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: "deleted@test.com" }]
      });

      const res = await request(app).delete("/users/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 if user not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).delete("/users/999");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /users/:userId", () => {
    it("should edit user successfully", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: "updated@test.com" }]
      });

      const res = await request(app)
        .put("/users/1")
        .send({ email: "updated@test.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe("updated@test.com");
    });

    it("should return 404 if user not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).put("/users/999").send({ email: "none@test.com" });
      expect(res.statusCode).toBe(404);
    });
  });
});
