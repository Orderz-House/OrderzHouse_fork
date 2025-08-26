const request = require("supertest");
const {app} = require("../../index");
const { pool } = require("../../models/db");

// Mock DB
jest.mock("../../models/db", () => ({
  pool: {
    query: jest.fn(),
  },
}));


jest.mock("../../middleware/authentication", () => {
  return (req, res, next) => {
    req.token = { userId: 1 }; 
    next();
  };
});

// Mock Authorization Middleware
jest.mock("../../middleware/authorization", () => {
  return () => (req, res, next) => next();
});

describe("Feedback Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================
  // Add Feedback
  // ===========================
  it("should add a feedback", async () => {
    const mockFeedback = {
      id: 1,
      freelancer_id: 2,
      content: "Great work!",
      type: "positive",
      created_at: new Date().toString(),
    };

    pool.query.mockResolvedValueOnce({ rows: [mockFeedback] });

    const res = await request(app)
      .post("/feedbacks/add")
      .send({
        freelancer_id: 2,
        content: "Great work!",
        type: "positive",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Feedback added successfully");
    expect(res.body.feedback).toEqual(mockFeedback);
  });

  it("should return 400 if required fields are missing in addFeedback", async () => {
    const res = await request(app).post("/feedbacks/add").send({
      freelancer_id: null,
      content: "",
      type: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("freelancer_id, content, and type are required");
  });

  // ===========================
  // View Feedbacks By Freelancer ID
  // ===========================
  it("should return feedbacks for a freelancer", async () => {
    const mockFeedbacks = [
      {
        id: 1,
        user_id: 1,
        freelancer_id: 2,
        content: "Excellent job",
        type: "positive",
        created_at: new Date(),
        reviewer_id: 1,
        freelancer_id: 2,
      },
    ];

    pool.query.mockResolvedValueOnce({ rows: mockFeedbacks });

    const res = await request(app).get("/feedbacks/freelancer/2");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.feedbacks.length).toBeGreaterThan(0);
  });

  it("should return 404 if no feedbacks found for freelancer", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/feedbacks/freelancer/99");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No feedback found for this freelancer");
  });

  // ===========================
  // View All Feedbacks
  // ===========================
  it("should return all feedbacks", async () => {
    const mockFeedbacks = [
      {
        id: 1,
        content: "Well done",
        type: "positive",
        created_at: new Date(),
        reviewer_id: 1,
        freelancer_id: 2,
      },
    ];

    pool.query.mockResolvedValueOnce({ rows: mockFeedbacks });

    const res = await request(app).get("/feedbacks");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.feedbacks.length).toBeGreaterThan(0);
  });

  it("should return 404 if no feedbacks exist", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/feedbacks");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No feedbacks found");
  });
});
