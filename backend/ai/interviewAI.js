// const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const fs = require("fs");
// const axios = require("axios");
// const path = require("path");

// // AWS S3 Client Configuration (v3)
// const s3Client = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     }
// });

// /**
//  * Fetch the latest .webm recording from S3
//  */
// async function fetchLatestRecording() {
//     try {
//         console.log("📂 Fetching latest .webm file from S3...");

//         const bucketName = process.env.AWS_S3_BUCKET_NAME;
//         const listCommand = new ListObjectsV2Command({ Bucket: bucketName, Prefix: "recordings/" });
        
//         const { Contents } = await s3Client.send(listCommand);
//         if (!Contents || Contents.length === 0) {
//             console.error("❌ No recordings found in S3 bucket!");
//             return null;
//         }

//         // Sort by LastModified and get the latest file
//         const latestFile = Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))[0].Key;
//         console.log("✅ Latest recording:", latestFile);

//         return latestFile;
//     } catch (error) {
//         console.error("❌ Error fetching latest recording:", error);
//         return null;
//     }
// }

// /**
//  * Download the latest .webm recording from S3
//  */
// async function downloadRecording(fileKey) {
//     try {
//         const bucketName = process.env.AWS_S3_BUCKET_NAME;
//         const filePath = path.join(__dirname, "temp_interview.webm");

//         // Generate pre-signed URL
//         const command = new GetObjectCommand({ Bucket: bucketName, Key: fileKey });
//         const url = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // 60 seconds

//         // Download file using Axios
//         const response = await axios({ method: "GET", url: url, responseType: "stream" });
//         const fileStream = fs.createWriteStream(filePath);
//         response.data.pipe(fileStream);

//         await new Promise((resolve, reject) => {
//             fileStream.on("finish", resolve);
//             fileStream.on("error", reject);
//         });

//         console.log("✅ File downloaded:", filePath);
//         return filePath;
//     } catch (error) {
//         console.error("❌ Error downloading recording:", error);
//         return null;
//     }
// }

// /**
//  * Analyze the latest interview recording
//  */
// async function analyzeInterview() {
//     try {
//         const latestFile = await fetchLatestRecording();
//         if (!latestFile) return { error: "No interview recordings available for analysis." };

//         const filePath = await downloadRecording(latestFile);
//         if (!filePath) return { error: "Failed to download recording from S3." };

//         const transcript = await transcribeAudio(filePath);
//         console.log("📜 Transcript:", transcript);

//         const analysis = await analyzeTranscript(transcript);

//         // Cleanup temp file
//         fs.unlink(filePath, (err) => {
//             if (err) console.error("❌ Error deleting temp file:", err);
//             else console.log("🗑️ Temporary file deleted.");
//         });

//         return analysis;
//     } catch (error) {
//         console.error("❌ Error in analyzeInterview:", error);
//         return { error: "Interview analysis failed. Please try again later." };
//     }
// }

// /**
//  * Convert `.webm` to text using OpenAI Whisper API
//  */
// async function transcribeAudio(filePath) {
//     try {
//         const apiKey = process.env.OPENAI_API_KEY;
        
//         const response = await axios.post(
//             "https://api.openai.com/v1/audio/transcriptions",
//             {
//                 file: fs.createReadStream(filePath),
//                 model: "whisper-1",
//                 language: "en",
//                 response_format: "json"
//             },
//             { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "audio/webm" } }
//         );

//         return response.data.text;
//     } catch (error) {
//         console.error("❌ Error in transcribeAudio:", error);
//         return "Speech-to-text conversion failed.";
//     }
// }

// /**
//  * Perform AI analysis on the transcript using GPT-4
//  */
// async function analyzeTranscript(transcript) {
//     try {
//         const apiKey = process.env.OPENAI_API_KEY;
        
//         const prompt = `
//         You are an AI interview evaluator. Analyze the following interview transcript and provide a structured assessment. 
//         Format the response in JSON with these fields:
//         - "score": An overall score from 1-10.
//         - "strengths": A list of 3 key strengths.
//         - "weaknesses": A list of 3 key weaknesses.
//         - "improvements": A list of 3 suggested improvements.
        
//         Transcript:
//         """${transcript}"""
//         `;

//         const response = await axios.post(
//             "https://api.openai.com/v1/chat/completions",
//             {
//                 model: "gpt-4",
//                 messages: [{ role: "system", content: prompt }],
//                 temperature: 0.7
//             },
//             { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
//         );

//         return JSON.parse(response.data.choices[0].message.content);
//     } catch (error) {
//         console.error("❌ Error in analyzeTranscript:", error);
//         return { error: "AI analysis failed. Please try again." };
//     }
// }

// module.exports = { analyzeInterview };