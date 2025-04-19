const express = require("express");
const { uploadRecording } = require("../controllers/uploadVideoController");

const router = express.Router();

router.post("/upload-recording", uploadRecording);

module.exports = router;