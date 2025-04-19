const express = require("express");
const Interview = require("../models/interviewModel");

const router = express.Router();

router.post("/save", async (req, res) => {
    const { answers } = req.body; // Expecting an object of question-answer pairs

    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ error: "No answers provided" });
    }

    // Convert the object into an array of {question, answer}
    const responses = Object.entries(answers).map(([question, answer]) => ({
        question,
        answer
    }));

    try {
        const interview = new Interview({ responses });
        await interview.save();
        res.json({ message: "Interview saved successfully", interview });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to save interview" });
    }
});

module.exports = router;
