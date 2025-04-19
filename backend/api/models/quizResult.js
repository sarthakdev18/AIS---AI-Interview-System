const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
    userId: { type: String, required: true },  // 👈 Changed from ObjectId to String
    quizId: { type: String, required: true },  
    score: { type: Number, required: true },
    timeTaken: { type: Number },
    status: { type: String, required: true }
});

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
module.exports = QuizResult;
