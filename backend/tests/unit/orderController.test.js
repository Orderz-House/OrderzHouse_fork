const {
  createOrders,
  getOrders,
  getOrdersByCategory,
  deleteOrder,
  getOrderByid,
  chooseOrder,
} = require("../../controller/orders");

const pool = require("../../models/db");

jest.mock("../../models/db", () => ({
  query: jest.fn(),
}));

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
    pool.query.mockClear();
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
    pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

    await createOrders(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        order: expect.any(Object),
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
    pool.query.mockResolvedValue({ rows: [] });

    await deleteOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("chooseOrder - missing data", async () => {
    req.body = {};

    await chooseOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
