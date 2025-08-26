const request = require("supertest");
const {app} = require("../../index"); 
const { pool } = require("../../models/db");

jest.mock("../../models/db", () => ({
  pool: { query: jest.fn() },
}));

jest.mock("../../middleware/authentication", () => (req, res, next) => {
  req.token = { userId: 1 };
  next();
});

describe("Appointments Routes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("POST /appointments/ should create appointment", async () => {
    const mockAppointment = { id: 1, freelancer_id: 1, appointment_type: "online", status: "pending" };
    pool.query.mockResolvedValueOnce({ rows: [mockAppointment] });

    const res = await request(app)
      .post("/appointments/")
      .send({ appointment_date: "2025-08-26T10:00:00Z", appointment_type: "online", message: "Test" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.appointment).toMatchObject(mockAppointment);
  });

  it("PATCH /appointments/reschedule/:appointment_id should reschedule", async () => {
    const mockAppointment = { id: 1, appointment_date: "2025-08-27T10:00:00Z" };
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockAppointment] });

    const res = await request(app)
      .patch("/appointments/reschedule/1")
      .send({ appointment_date: "2025-08-27T10:00:00Z" });

    expect(res.status).toBe(200);
    expect(res.body.appointment).toMatchObject(mockAppointment);
  });

  it("PATCH /appointments/accept/:appointment_id should accept", async () => {
    const mockAppointment = { id: 1, status: "accepted" };
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockAppointment] });

    const res = await request(app).patch("/appointments/accept/1");
    expect(res.status).toBe(200);
    expect(res.body.appointment).toMatchObject(mockAppointment);
  });

  it("GET /appointments/get should return all appointments", async () => {
    const mockAppointments = [{ id: 1, appointment_type: "online", status: "pending" }];
    pool.query.mockResolvedValueOnce({ rows: mockAppointments });

    const res = await request(app).get("/appointments/get");
    expect(res.status).toBe(200);
    expect(res.body.appointments.length).toBeGreaterThan(0);
  });

  it("GET /appointments/my should return freelancer appointments", async () => {
    const mockAppointments = [{ id: 1, appointment_type: "online", status: "pending" }];
    pool.query.mockResolvedValueOnce({ rows: mockAppointments });

    const res = await request(app).get("/appointments/my");
    expect(res.status).toBe(200);
    expect(res.body.appointments.length).toBeGreaterThan(0);
  });
});
