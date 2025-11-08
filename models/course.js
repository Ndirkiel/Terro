const mongoose = require("mongoose");

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

module.exports = mongoose.model("Course", courseSchema);
