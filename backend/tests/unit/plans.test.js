const { getPlans, createPlan, editPlan, deletePlan, getPlanSubscriptions } = require("../../controller/plans");

// mock db
jest.mock("../../models/db", () => ({
  query: jest.fn(),
}));

const pool = require("../../models/db");

describe("Plans Controller - Unit Tests", () => {
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

  test("getPlans - should return all plans", async () => {
    const mockPlans = [{ id: 1, name: "Basic" }];
    pool.query.mockResolvedValueOnce({ rows: mockPlans });

    await getPlans({}, mockRes);

    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM Plans");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, plans: mockPlans });
  });

  test("createPlan - should create a plan", async () => {
    const req = { body: { name: "Pro", price: 50, duration: "1 month", description: "Test" } };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] });

    await createPlan(req, mockRes);

    expect(pool.query).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Plan created successfully" })
    );
  });

  test("editPlan - should update a plan", async () => {
    const req = { params: { id: 1 }, body: { name: "Updated", price: 100, duration: "1 year", description: "New" } };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] });

    await editPlan(req, mockRes);

    expect(pool.query).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test("deletePlan - should delete a plan", async () => {
    const req = { params: { id: 1 } };
    pool.query.mockResolvedValueOnce({});

    await deletePlan(req, mockRes);

    expect(pool.query).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Plan deleted successfully" })
    );
  });

  test("getPlanSubscriptions - should return subscriptions count", async () => {
    const req = { params: { id: 1 } };
    const mockResult = [{ id: 1, name: "Basic", subscription_count: 3 }];
    pool.query.mockResolvedValueOnce({ rows: mockResult });

    await getPlanSubscriptions(req, mockRes);

    expect(pool.query).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, plans: mockResult });
  });
});
