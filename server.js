const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// ----------------------
// Middlewares
// ----------------------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ----------------------
// MongoDB Connection
// ----------------------
mongoose.connect("mongodb://127.0.0.1:27017/courseStore")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ----------------------
// Schemas & Models
// ----------------------
const courseSchema = new mongoose.Schema({
  title: String,
  instructor: String,
  category: String,
  location: String,
  price: Number,
  rating: Number,
  spaces: Number,
  cover: String
});
const Course = mongoose.model("Course", courseSchema);

// Updated Order schema to include full customer info
const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    notes: String,
    coupon: String
  },
  items: [
    {
      courseId: { type: String, required: true },
      title: String,
      price: Number,
      qty: Number
    }
  ],
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

// ----------------------
// Seed Initial Courses (only if DB is empty)
// ----------------------
const initialCourses = [
  {
    title: "English Basics",
    instructor: "John Doe",
    category: "English",
    location: "USA",
    price: 49.99,
    rating: 4.5,
    spaces: 10,
    cover: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  },
  {
    title: "French Advanced",
    instructor: "Marie Curie",
    category: "French",
    location: "France",
    price: 79.99,
    rating: 4.8,
    spaces: 8,
    cover: "https://cdn-icons-png.flaticon.com/512/1048/1048949.png"
  },
  {
    title: "Spanish Beginner",
    instructor: "Carlos Lopez",
    category: "Spanish",
    location: "Spain",
    price: 39.99,
    rating: 4.2,
    spaces: 12,
    cover: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png"
  }
];

async function preloadCourses() {
  const count = await Course.countDocuments();
  if (count === 0) {
    console.log("📥 Seeding sample courses...");
    await Course.insertMany(initialCourses);
    console.log("✅ Courses added.");
  }
}
preloadCourses();

// ----------------------
// API Routes
// ----------------------

// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new course
app.post("/api/courses", async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total } = req.body;

    if (!customer || !customer.name || !customer.email) {
      return res.status(400).json({ error: "Customer name and email are required" });
    }

    const newOrder = new Order({ customer, items, total });
    await newOrder.save();
    res.status(201).json({ message: "Order saved", order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Serve Frontend
// ----------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));
