const request = require("supertest");
const app = require("../app"); 

describe("Orders Integration Tests", () => {
  let token = { userId: 1 }; 

  test("POST /orders/create - create new order", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", "Bearer faketoken") 
      .send({
        category_id: 2,
        title: "Integration Test Order",
        description: "Test desc",
        budget: 300,
        status: "open",
        due_date: "2025-12-31",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.order).toHaveProperty("title", "Integration Test Order");
  });

  test("GET /orders/getOrders - should return list", async () => {
    const res = await request(app)
      .get("/orders")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });
});