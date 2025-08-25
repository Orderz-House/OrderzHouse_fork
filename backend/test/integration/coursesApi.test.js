
const request = require("supertest");
const app = require("../../app");

describe("Courses API Integration", () => {
  it("POST /courses → should create a course", async () => {
    const res = await request(app)
      .post("/courses")
      .send({ title: "React", description: "Frontend", price: 300 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("course");
  });

  it("GET /courses → should return list of courses", async () => {
    const res = await request(app).get("/courses");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("courses");
  });
});
