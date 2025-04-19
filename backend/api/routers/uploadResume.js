const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv").config();

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Configure Multer (for file uploads)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

// Upload Resume API
router.post("/upload-resume", upload.single("resume"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `resumes/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const uploadResult = await s3.upload(uploadParams).promise();
        res.json({ message: "Resume uploaded successfully", fileUrl: uploadResult.Location });
    } catch (error) {
        console.error("AWS S3 Upload Error:", error);
        res.status(500).json({ error: "Failed to upload resume" });
    }
});

module.exports = router;
