const express = require("express");
const { uploadResume, analyzeResumeFromS3, uploadMiddleware } = require("../controllers/resumeController");

const router = express.Router();

// ✅ Upload Resume Endpoint
router.post("/upload-resume", uploadMiddleware, uploadResume);

// ✅ Analyze Resume Endpoint
router.post("/analyze-resume", analyzeResumeFromS3);

module.exports = router;
