const mongoose = require("mongoose");
const QuizResult = require("../models/quizResult");

exports.submitQuiz = async (req, res) => {
    try {
        const { userId, quizId, score, timeTaken, status } = req.body;

        if (!userId || !quizId || !score) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const result = new QuizResult({
            userId,
            quizId,
            score,
            timeTaken: status === "Completed" ? timeTaken : null,
            status
        });

        await result.save();
        res.status(201).json({ success: true, message: "Quiz result saved successfully!" });

    } catch (error) {
        console.error("🔥 Error saving quiz result:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
