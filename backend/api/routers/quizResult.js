const express = require("express");
const router = express.Router();
const QuizResult = require("../models/quizResult"); // Adjust the path as needed

router.post("/submit", async (req, res) => {  // 👈 Ensure this matches frontend's fetch URL
    try {
        console.log("Received Data: ", req.body);

        const { userId, quizId, score, timeTaken, status } = req.body;

        if (!userId || !quizId || !score || !status) {
            return res.status(400).json({ success: false, message: "Missing userId or quizId" });
        }

        const newResult = new QuizResult({
            userId,
            quizId,
            score,
            timeTaken,
            status
        });

        await newResult.save();
        res.json({ success: true, message: "Quiz result saved successfully!" });

    } catch (error) {
        console.error("Error saving quiz result:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;