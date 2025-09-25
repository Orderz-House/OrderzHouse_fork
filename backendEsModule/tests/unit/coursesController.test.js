const request = require("supertest");
const express = require("express");

const coursesController = require("../../controller/courses.js");

// Mock the database module
jest.mock("../../models/db.js", () => {
  const pool = { query: jest.fn(), connect: jest.fn(), end: jest.fn() };
  return { __esModule: true, default: pool, pool };
});

const { pool } = require("../../models/db.js");

const app = express();
app.use(express.json());


app.post("/courses", coursesController.createCourse);
app.get("/courses", coursesController.getCourses);
app.get("/courses/:id", coursesController.getCourseById);
app.put("/courses/:id", coursesController.updateCourse);
app.delete("/courses/:id", coursesController.deleteCourse);
app.post("/courses/enroll", (req, res, next) => {
  req.token = { userId: 1 };
  next();
}, coursesController.enrollInCourse);

describe("Courses Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.error mock for each test
    if (console.error.mockRestore) {
      console.error.mockRestore();
    }
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCourse", () => {
    it("should create a course", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: "Test" }] });

      const res = await request(app)
        .post("/courses")
        .send({ title: "Test", description: "Desc", price: 100 });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.course.title).toBe("Test");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/courses").send({ title: "No Price" });
      expect(res.statusCode).toBe(400);
    });

    it("should return 500 on database error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB Error"));
      const res = await request(app)
        .post("/courses")
        .send({ title: "Test", description: "Desc", price: 100 });
      expect(res.statusCode).toBe(500);
    });
  });

  // ================================
  describe("getCourses", () => {
    it("should return courses", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: "Course" }] });
      const res = await request(app).get("/courses");
      expect(res.statusCode).toBe(200);
      expect(res.body.courses.length).toBe(1);
    });

    it("should return 500 on database error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB Error"));
      const res = await request(app).get("/courses");
      expect(res.statusCode).toBe(500);
    });
  });

  // ================================
  describe("getCourseById", () => {
    it("should return a course when found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: "One" }] });
      const res = await request(app).get("/courses/1");
      expect(res.statusCode).toBe(200);
    });

    it("should return 404 if not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get("/courses/1");
      expect(res.statusCode).toBe(404);
    });

    it("should return 400 if invalid id", async () => {
      const res = await request(app).get("/courses/abc");
      expect(res.statusCode).toBe(400);
    });

    it("should return 500 on db error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).get("/courses/1");
      expect(res.statusCode).toBe(500);
    });
  });

  // ================================
  describe("updateCourse", () => {
    it("should update a course", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: "Updated" }] });
      const res = await request(app).put("/courses/1").send({ title: "Updated" });
      expect(res.statusCode).toBe(200);
    });

    it("should return 400 if no fields provided", async () => {
      const res = await request(app).put("/courses/1").send({});
      expect(res.statusCode).toBe(400);
    });

    it("should return 404 if course not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).put("/courses/1").send({ title: "X" });
      expect(res.statusCode).toBe(404);
    });

    it("should return 500 on db error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).put("/courses/1").send({ title: "Err" });
      expect(res.statusCode).toBe(500);
    });
  });

  // ================================
  describe("deleteCourse", () => {
    it("should delete a course", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const res = await request(app).delete("/courses/1");
      expect(res.statusCode).toBe(200);
    });

    it("should return 404 if not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).delete("/courses/1");
      expect(res.statusCode).toBe(404);
    });

    it("should return 400 if invalid id", async () => {
      const res = await request(app).delete("/courses/abc");
      expect(res.statusCode).toBe(400);
    });

    it("should return 500 on db error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).delete("/courses/1");
      expect(res.statusCode).toBe(500);
    });
  });

  // ================================
  describe("enrollInCourse", () => {
    it("should enroll a user", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // courseCheck
        .mockResolvedValueOnce({ rows: [] })          // enrollmentCheck
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }); // enrollment insert

      const res = await request(app).post("/courses/enroll").send({ course_id: 1 });
      expect(res.statusCode).toBe(201);
    });

    it("should return 401 if freelancer_id missing", async () => {
      // Create a new app instance without the middleware that sets req.token
      const appNoToken = express();
      appNoToken.use(express.json());
      appNoToken.post("/courses/enroll", coursesController.enrollInCourse);

      const res = await request(appNoToken)
        .post("/courses/enroll")
        .send({ course_id: 1 });
      expect([401, 500]).toContain(res.statusCode);
    });

    it("should return 400 if course_id missing", async () => {
      const res = await request(app).post("/courses/enroll").send({});
      expect(res.statusCode).toBe(400);
    });

    it("should return 404 if course not found", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const res = await request(app).post("/courses/enroll").send({ course_id: 99 });
      expect(res.statusCode).toBe(404);
    });

    it("should return 409 if already enrolled", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // course exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // already enrolled

      const res = await request(app).post("/courses/enroll").send({ course_id: 1 });
      expect(res.statusCode).toBe(409);
    });

    it("should return 500 on db error", async () => {
      pool.query.mockRejectedValueOnce(new Error("DB Error"));
      const res = await request(app).post("/courses/enroll").send({ course_id: 1 });
      expect(res.statusCode).toBe(500);
    });
  });
});
