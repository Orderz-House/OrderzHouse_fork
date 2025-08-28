const request = require("supertest");
const express = require("express");
const userController = require("../../controller/user.js");
const { pool } = require("../../models/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create a test app
const app = express();
app.use(express.json());

// Add user routes
app.post("/users/register", userController.register);
app.post("/users/login", userController.login);
app.get("/users/view", userController.viewUsers);
app.delete("/users/delete/:userId", userController.deleteUser);
app.put("/users/edit/:userId", userController.editUser);
app.post("/users/freelancer/portfolio/create", userController.createPortfolio);
app.put(
  "/users/freelancer/portfolio/edit/:userId",
  userController.editPortfolioFreelancer
);
app.post("/users/freelancers", userController.getAllFreelancers);
app.delete(
  "/users/freelancer/delete/:userId",
  userController.deleteFreelancerById
);

// Database and middleware mocks are now handled globally in tests/setup.js

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn((password) => Promise.resolve("hashed_" + password)),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mockedtoken"),
}));

describe("User Routes", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "testsecret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================
  // register
  // ===========================
  it("should register a user", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
        },
      ],
    });

    const res = await request(app).post("/users/register").send({
      role_id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: "password123",
      phone_number: "1234567890",
      country: "USA",
      username: "johndoe",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User registered successfully");
  });

  // ===========================
  // log in
  // ===========================
  it("should log in a user", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          email: "john.doe@example.com",
          password: hashedPassword,
          role_id: 1,
        },
      ],
    });

    const res = await request(app).post("/users/login").send({
      email: "john.doe@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Valid login credentials");
    expect(res.body.token).toBe("mockedtoken");
  });

  // ===========================
  // fetch all users
  // ===========================
  it("should return a list of users", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
        },
      ],
    });

    const res = await request(app)
      .get("/users/view")
      .set("Authorization", "Bearer mockedtoken");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  // ===========================
  // delete a user
  // ===========================
  it("should delete a user", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          is_deleted: true,
        },
      ],
    });

    const res = await request(app)
      .delete("/users/delete/1")
      .set("Authorization", "Bearer mockedtoken");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User deleted successfully");
  });

  // ===========================
  // edit a user
  // ===========================
  it("should edit a user", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          first_name: "Johnathan",
          last_name: "Doe",
          email: "johnathan.doe@example.com",
          phone_number: "9876543210",
          country: "USA",
          username: "johnnyd",
          role_id: 1,
        },
      ],
    });

    const res = await request(app)
      .put("/users/edit/1")
      .send({
        first_name: "Johnathan",
        last_name: "Doe",
        email: "johnathan.doe@example.com",
        phone_number: "9876543210",
        country: "USA",
        username: "johnnyd",
        role_id: 1,
      })
      .set("Authorization", "Bearer mockedtoken");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User updated successfully");
  });

  // ===========================
  // create a portfolio
  // ===========================
  it("should create a portfolio", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          freelancer_id: 1,
          title: "Freelance Developer",
          description: "Building web apps",
          skills: "JavaScript, Node.js",
          hourly_rate: 50,
          work_url: "https://example.com/portfolio",
        },
      ],
    });

    const res = await request(app)
      .post("/users/freelancer/portfolio/create")
      .send({
        freelancer_id: 1,
        title: "Freelance Developer",
        description: "Building web apps",
        skills: "JavaScript, Node.js",
        hourly_rate: 50,
        work_url: "https://example.com/portfolio",
      })
      .set("Authorization", "Bearer mockedtoken");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Portfolio created successfully");
  });

  // ===========================
  // fetch all freelancers
  // ===========================
  it("should fetch all freelancers", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          orders_count: 10,
          ip_addresses: [],
        },
      ],
    });

    const res = await request(app)
      .post("/users/freelancers")
      .send({ filter: "active" })
      .set("Authorization", "Bearer mockedtoken");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.freelancers.length).toBeGreaterThan(0);
  });
});
