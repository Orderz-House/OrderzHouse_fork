const {
  createCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  getCourseById,
} = require("../../controller/courses");

const pool = require("../../models/db");

jest.mock("../../models/db"); 

describe("Courses Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("createCourse → should create a course", async () => {
    req.body = { title: "JS Basics", description: "Intro", price: 100 };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...req.body }] });

    await createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      course: { id: 1, ...req.body },
    });
  });

  it("getCourses → should return courses", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: "Node", description: "Backend", price: 200 }],
    });

    await getCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      courses: [{ id: 1, title: "Node", description: "Backend", price: 200 }],
    });
  });

  it("getCourseById → should return 404 if not found", async () => {
    req.params = { id: 99 };
    pool.query.mockResolvedValueOnce({ rows: [] });

    await getCourseById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Course not found",
    });
  });
});
