const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Downloads a file from AWS S3 (from the recordings/ folder).
 * @param {string} fileName - The name of the file inside the recordings/ folder.
 * @returns {Promise<string>} - Local path of the downloaded file.
 */
async function downloadFileFromS3(fileName) {
  const s3Key = `recordings/${fileName}`; // Ensure it's fetching from the recordings/ folder
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir); // Ensure temp directory exists

  const filePath = path.join(tempDir, fileName);
  const fileStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket: BUCKET_NAME, Key: s3Key })
      .createReadStream()
      .pipe(fileStream)
      .on("finish", () => resolve(filePath))
      .on("error", reject);
  });
}

/**
 * Transcribes a .webm file using OpenAI Whisper.
 * @param {string} filePath - Local path of the file.
 * @returns {Promise<string>} - Transcribed text.
 */
async function transcribeAudio(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("model", "whisper-1");

  try {
    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error.response?.data || error.message);
    throw new Error("Failed to transcribe audio.");
  }
}

module.exports = { downloadFileFromS3, transcribeAudio };
