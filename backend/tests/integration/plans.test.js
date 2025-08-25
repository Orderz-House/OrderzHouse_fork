const request = require("supertest");
const express = require("express");
const plansRouter = require("../../router/plans");

// mock db real connection OR test db
jest.mock("../../models/db", () => ({
  query: jest.fn(),
}));

const pool = require("../../models/db");

const app = express();
app.use(express.json());
app.use("/plans", plansRouter);

describe("Plans API - Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /plans should return plans", async () => {
    const mockPlans = [{ id: 1, name: "Basic" }];
    pool.query.mockResolvedValueOnce({ rows: mockPlans });

    const res = await request(app).get("/plans");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, plans: mockPlans });
  });

  test("POST /plans/create should create a plan", async () => {
    const newPlan = { name: "Pro", price: 50, duration: "1 month", description: "Test" };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...newPlan }] });

    const res = await request(app).post("/plans/create").send(newPlan);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("PUT /plans/edit/:id should update a plan", async () => {
    const updatedPlan = { name: "Updated", price: 100, duration: "1 year", description: "New" };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...updatedPlan }] });

    const res = await request(app).put("/plans/edit/1").send(updatedPlan);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /plans/delete/:id should delete a plan", async () => {
    pool.query.mockResolvedValueOnce({});

    const res = await request(app).delete("/plans/delete/1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /plans/:id/subscriptions should return subscription count", async () => {
    const mockSubscriptions = [{ id: 1, name: "Basic", subscription_count: 2 }];
    pool.query.mockResolvedValueOnce({ rows: mockSubscriptions });

    const res = await request(app).get("/plans/1/subscriptions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, plans: mockSubscriptions });
  });
});
