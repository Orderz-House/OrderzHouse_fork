const {
  createOrders,
  getOrders,
  getOrdersByCategory,
  deleteOrder,
  getOrderByid,
  chooseOrder,
} = require("../../controller/orders.js");

// Mock the entire db module
jest.mock("../../models/db.js", () => ({
  pool: {
    query: jest.fn()
  }
}));

// Import after mocking
const { pool } = require("../../models/db.js");

describe("Orders Controller Unit Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      token: { userId: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("createOrders - success", async () => {
    req.body = {
      category_id: 1,
      title: "Test Order",
      description: "Desc",
      budget: 100,
      status: "open",
      due_date: "2025-12-01",
    };
    
    // Mock successful query
    pool.query.mockResolvedValue({ 
      rows: [{ id: 1, title: "Test Order" }] 
    });

    await createOrders(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Order created successfully",
      })
    );
  });

  test("getOrders - success", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await getOrders(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getOrdersByCategory - invalid id", async () => {
    req.params.category_id = "abc";

    await getOrdersByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deleteOrder - not found", async () => {
    req.params.id = "1";
    // Mock empty result (no rows affected)
    pool.query.mockResolvedValue({ rows: [] });

    await deleteOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deleteOrder - success", async () => {
    req.params.id = "1";
    // Mock successful deletion
    pool.query.mockResolvedValue({ 
      rows: [{ id: 1, is_deleted: true }] 
    });

    await deleteOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Order deleted"
    });
  });

  test("chooseOrder - missing data", async () => {
    req.body = {};

    await chooseOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("chooseOrder - success", async () => {
    req.body = { order_id: 123 };
    pool.query.mockResolvedValue({ 
      rows: [{ id: 1, order_id: 123, freelancer_id: 1 }] 
    });

    await chooseOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});