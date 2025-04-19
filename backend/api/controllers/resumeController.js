require("dotenv").config();
const AWS = require("aws-sdk");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const multer = require("multer");

// AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to analyze resume using AI
async function analyzeResumeAI(resumeText) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an HR expert analyzing resumes." },
                { role: "user", content: `Analyze this resume and list key skills: ${resumeText}` }
            ]
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("⚠️ AI Analysis Error:", error);
        return "AI analysis failed";
    }
}

// Function to analyze resume using keyword matching
function analyzeResumeBasic(text) {
    const requiredSkills = ["JavaScript", "React", "Node.js", "MongoDB", "AWS"];
    const foundSkills = requiredSkills.filter(skill => text.includes(skill));

    const score = (foundSkills.length / requiredSkills.length) * 100;
    return { skills: foundSkills, score: Math.round(score) };
}

// ✅ Upload Resume to S3
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileName = `resumes/${Date.now()}-${req.file.originalname}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };

        await s3.upload(params).promise();

        console.log("📡 Resume uploaded successfully:", fileName); // ✅ Debugging log

        res.json({ message: "Resume uploaded successfully", fileKey: fileName });
    } catch (error) {
        console.error("⚠️ Upload Error:", error);
        res.status(500).json({ error: "Resume upload failed" });
    }
};

// ✅ Analyze Resume from S3
exports.analyzeResumeFromS3 = async (req, res) => {
    const { fileUrl } = req.body;
    if (!fileUrl) return res.status(400).json({ error: "Missing fileUrl" });
    
    // Extract fileKey from fileUrl
    const fileKey = fileUrl.split("/").pop();
    console.log("🔍 Extracted fileKey:", fileKey);

    try {
        // Download the resume from S3
        const params = { Bucket: process.env.AWS_BUCKET_NAME, Key: fileKey };
        const s3Data = await s3.getObject(params).promise();
        const pdfData = await pdfParse(s3Data.Body);
        const resumeText = pdfData.text;

        console.log("📝 Extracted Resume Text:", resumeText.substring(0, 200), "..."); // ✅ Partial log for debugging

        // Perform AI and basic analysis
        const basicAnalysis = analyzeResumeBasic(resumeText);
        const aiAnalysis = await analyzeResumeAI(resumeText);

        res.json({
            text: resumeText,
            basicAnalysis,
            aiAnalysis
        });
    } catch (error) {
        console.error("⚠️ Resume Processing Error:", error);
        res.status(500).json({ error: "Resume analysis failed" });
    }
};

// ✅ Middleware for handling file upload in routes
exports.uploadMiddleware = upload.single("resume");