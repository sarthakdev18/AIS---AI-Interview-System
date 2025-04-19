const express = require("express");
const { analyzeInterview } = require("../controllers/interviewAnalysisController");

const router = express.Router();

router.post("/analyze", async (req, res) => {
    try {
        const result = await analyzeInterview(); // No need to pass S3 URL, fetch latest
        res.json(result);
    } catch (error) {
        console.error("Interview Analysis Error:", error);
        res.status(500).json({ error: "Interview analysis failed. Please try again later." });
    }
});

module.exports = router;