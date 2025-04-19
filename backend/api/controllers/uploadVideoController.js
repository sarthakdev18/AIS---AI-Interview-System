const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const s3 = require("../../config/s3");

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// ✅ Correctly define multer
const upload = multer({
    storage: multerS3({
        s3: new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        }),
        bucket: bucketName,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `recordings/${Date.now()}_${file.originalname}`);
        }
    })
}).single("video");

// ✅ Upload recording function
exports.uploadRecording = async (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: "File upload failed", details: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        res.json({ message: "Recording uploaded successfully!", fileUrl: req.file.location });
    });
};
