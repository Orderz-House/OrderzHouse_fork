import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, BookOpen } from "lucide-react";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses/view", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data.courses || []);
      setFiltered(res.data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = async () => {
    if (!form.title || !form.description || !form.price)
      return alert("Please fill all fields");
    try {
      await axios.post("http://localhost:5000/courses/create", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ title: "", description: "", price: "" });
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`http://localhost:5000/courses/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    const filteredCourses = courses.filter((c) =>
      c.title.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filteredCourses);
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-600">Course</span> Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all courses, create new ones, or remove old ones.
            </p>
          </div>
          <BookOpen className="text-blue-500 w-10 h-10" />
        </div>

        {/* Add Course Form */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-6 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <PlusCircle className="text-blue-600" /> Add New Course
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="number"
              placeholder="Price ($)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Course
          </button>
        </motion.div>

        {/* Search */}
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search course..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <p className="text-sm text-gray-500 ml-4">
            Total:{" "}
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            courses
          </p>
        </div>

        {/* Courses Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          {filtered.map((course, index) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {course.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-semibold">
                  ${course.price}
                </span>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No courses found
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ManageCourses;
