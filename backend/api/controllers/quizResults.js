const mongoose = require("mongoose");

const quizResultSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, required: true },
    timeTaken: { type: Number, default: null }, // Null if not completed
    status: { type: String, enum: ["Completed", "Not Completed"], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);