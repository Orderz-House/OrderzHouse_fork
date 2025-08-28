const { subscriptionToPlan, getSubscriptionByUserId } = require("../../controller/subscriptions.js");

jest.mock("../../models/db.js", () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require("../../models/db.js");

describe("Subscriptions Controller - Unit Tests", () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("subscriptionToPlan - should create subscription successfully", async () => {
    const req = { body: { freelancer_id: 1, plan_id: 2, status: "active" } };

    pool.query
      .mockResolvedValueOnce({ rows: [{ duration: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] });

    await subscriptionToPlan(req, mockRes);

    expect(pool.query).toHaveBeenNthCalledWith(1, "SELECT duration FROM plans WHERE id = $1", [req.body.plan_id]);
    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      "INSERT INTO subscriptions (freelancer_id, plan_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5)",
      expect.any(Array)
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Subscription created successfully",
      subscription: { id: 1, ...req.body }
    });
  });

  test("subscriptionToPlan - should handle missing fields", async () => {
    const req = { body: { freelancer_id: 1 } };

    await subscriptionToPlan(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "freelancer_id, plan_id, and status are required"
    });
  });

  test("subscriptionToPlan - should handle plan not found", async () => {
    const req = { body: { freelancer_id: 1, plan_id: 99, status: "active" } };
    pool.query.mockResolvedValueOnce({ rows: [] });

    await subscriptionToPlan(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Plan not found"
    });
  });

  test("subscriptionToPlan - should handle error fetching plan", async () => {
    const req = { body: { freelancer_id: 1, plan_id: 2, status: "active" } };
    const errorMessage = "Database error";
    pool.query.mockRejectedValueOnce(new Error(errorMessage));

    await subscriptionToPlan(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching plan details",
      error: errorMessage
    });
  });

  test("subscriptionToPlan - should handle error inserting subscription", async () => {
    const req = { body: { freelancer_id: 1, plan_id: 2, status: "active" } };
    const errorMessage = "Insert failed";

    pool.query
      .mockResolvedValueOnce({ rows: [{ duration: 1 }] })
      .mockRejectedValueOnce(new Error(errorMessage));

    await subscriptionToPlan(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to create subscription",
      error: errorMessage
    });
  });

  test("getSubscriptionByUserId - should return subscriptions", async () => {
    const req = { params: { userId: 1 } };
    const mockSubs = [
      { id: 1, freelancer_id: 1, plan_name: "Basic", first_name: "Ali", last_name: "Khan", email: "ali@test.com" }
    ];
    pool.query.mockResolvedValueOnce({ rows: mockSubs });

    await getSubscriptionByUserId(req, mockRes);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [req.params.userId]);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      subscriptions: mockSubs
    });
  });

  test("getSubscriptionByUserId - should handle missing userId", async () => {
    const req = { params: {} };

    await getSubscriptionByUserId(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "userId is required"
    });
  });

  test("getSubscriptionByUserId - should handle no subscriptions", async () => {
    const req = { params: { userId: 1 } };
    pool.query.mockResolvedValueOnce({ rows: [] });

    await getSubscriptionByUserId(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "No subscriptions found for this user"
    });
  });

  test("getSubscriptionByUserId - should handle database error", async () => {
    const req = { params: { userId: 1 } };
    const errorMessage = "Database error";
    pool.query.mockRejectedValueOnce(new Error(errorMessage));

    await getSubscriptionByUserId(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching subscriptions",
      error: errorMessage
    });
  });
});
