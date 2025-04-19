// 1️⃣ Interview Questions (Predefined Chat History)
const chatHistory = [
    "Welcome to the AI Technical Interview! Please introduce yourself.",
    "What technologies have you worked with?",
    "Tell me about a challenging project you worked on.",
    "How do you approach solving technical problems?",
    "Describe a time when you had to debug a complex issue.",
    "What are your thoughts on version control and collaboration?",
    "How do you ensure security in your applications?",
    "How do you handle performance optimization in coding?",
    "That concludes the interview. Thank you!"
];

let currentQuestionIndex = 0;
let recognition;
let isInterviewRunning = false;

let mediaRecorder;
let recordedChunks = [];

// 2️⃣ DOM Elements
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const botTextArea = document.getElementById("bot");
const outputTextarea = document.getElementById("output");

// function to start screen recording
async function startScreenRecording() {
    try {
        // Get screen video stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        // Get microphone audio stream separately
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Merge both video & audio streams
        const combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: "video/webm; codecs=vp9,opus" });

        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
            await uploadRecording(videoBlob);
        };

        mediaRecorder.start();
        console.log("✅ Screen recording started with audio...");
    } catch (error) {
        console.error("❌ Error starting screen recording: ", error);
    }
}

// function to stop screen recording
function stopScreenRecording() {
    if(mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("Screen recording stopped");
    }
}

// Upload recorded video and audio to AWS S3
async function uploadRecording(videoBlob) {
    const formData = new FormData();
    formData.append("video", videoBlob, "interview_recording.webm");

    try {
        const response = await fetch("http://localhost:8800/api/upload-recording", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Recording upload response: ", result);

        if(response.ok) {
            alert("Interview recording uploaded successfully!");
            document.getElementById("resumeUploadSection").style.display = "block"; // enable resume upload
        } else {
            alert("Failed to upload recording! Try again.");
        }
    } catch (error) {
        console.error("Error uploading recording: ", error);
        alert("Error uploading recording")
    }
}

// 3️⃣ Improved Text-to-Speech Function
function speak(text) {
    return new Promise((resolve, reject) => {
        // Ensure voices are loaded before speaking
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            console.log("⏳ Loading voices...");
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
            };
        }

        // Cancel any ongoing speech to avoid overlap
        if (speechSynthesis.speaking) {
            console.log("⏳ Stopping previous speech...");
            speechSynthesis.cancel();
        }

        // Delay speaking to ensure voices are loaded
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = voices.find(v => v.lang.startsWith("en")) || null; // Pick an English voice

            utterance.onend = () => {
                console.log("✅ Speech finished:", text);
                resolve();
            };

            utterance.onerror = (e) => {
                console.error("⚠️ Speech error:", e.error);
                reject(e);
            };

            speechSynthesis.speak(utterance);
        }, 500); // Delay to ensure no speech overlap
    });
}

// 4️⃣ Speech Recognition Setup
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = false; // 🔥 Stops after each answer (fixes event loss)
    recognition.interimResults = false; 

    recognition.onstart = () => {
        console.log("🎤 Listening...");
        startBtn.disabled = true;
        stopBtn.disabled = false;
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        outputTextarea.value = transcript; // Save answer
        console.log("🔎 You said:", transcript);

        // 🔥 Auto-submit answer & move to next question
        submitAnswer(transcript);

        // // 🔥 Check if there are more questions
        // if (currentQuestionIndex < chatHistory.length - 1) {
        //     currentQuestionIndex++;
        //     setTimeout(() => recognition.start(), 1000); // Continue listening
        // } else {
        //     console.log("✅ Interview completed. Stopping recognition.");
        //     isInterviewRunning = false;
        // }

        // Start listening again for the next answer
        setTimeout(() => recognition.start(), 1000);
    };

    recognition.onend = () => {
        console.log("⏹️ Speech recognition stopped.");

        if (isInterviewRunning) {
            console.log("🎤 Restarting recognition...");
            setTimeout(() => recognition.start(), 1000); // Restart after a short delay
        }
    };

    recognition.onerror = (event) => {
        console.error("⚠️ Speech recognition error:", event.error);
    };

    startBtn.addEventListener("click", async () => {
        if (!isInterviewRunning) {
            isInterviewRunning = true;
            await startScreenRecording(); // start recording first
            askNextQuestion(); // start interview
            recognition.start();
        }
    });

    stopBtn.addEventListener("click", () => {
        isInterviewRunning = false;
        recognition.stop();
        stopScreenRecording(); // stop recording
        console.log("⏹️ Speech recognition stopped.");
    });

} else {
    console.error("❌ Speech recognition not supported in this browser.");
    startBtn.disabled = true;
    stopBtn.disabled = true;
}

// 5️⃣ Ask Next Question
async function askNextQuestion() {
    if (currentQuestionIndex >= chatHistory.length) {
        console.log("✅ Interview finished.");
        botTextArea.value = "Interview completed. Thank you!";
        isInterviewRunning = false;
        return;
    }

    let question = chatHistory[currentQuestionIndex];
    botTextArea.value = `AI: ${question}`;
    console.log("🤖 Asking:", question);

    await speak(question); // Wait for AI to finish speaking
    recognition.start(); // 🔥 Start listening after AI finishes speaking
}

async function submitAnswer() {
    let answer = outputTextarea.value.trim();
    
    if (answer !== "") {
        let storedAnswers = JSON.parse(localStorage.getItem("interviewAnswers")) || {};
        storedAnswers[chatHistory[currentQuestionIndex]] = answer;
        localStorage.setItem("interviewAnswers", JSON.stringify(storedAnswers));

        console.log("✅ Answer submitted:", answer);
        outputTextarea.value = ""; // Clear input field
        currentQuestionIndex++; // Move to next question
        
        if (currentQuestionIndex >= chatHistory.length) {
            await sendToDatabase(storedAnswers); // 🔥 Send Data to MongoDB
        } else {
            askNextQuestion();
        }
    }
}

// 🔥 Function to Send Data to MongoDB
async function sendToDatabase() {
    let storedAnswers = JSON.parse(localStorage.getItem("interviewAnswers")) || {};

    if (Object.keys(storedAnswers).length === 0) {
        console.error("⚠️ No answers to send.");
        return;
    }

    const data = { answers: storedAnswers };

    console.log("📤 Sending to DB:", data);

    try {
        const response = await fetch("http://localhost:8800/api/interview/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("📡 Server Response:", result);
        
        if(response.ok) {
            alert("Interview saved successfully!");
            document.getElementById("resumeUploadSection").style.display = "block"; // show resume upload section
        }
    } catch (error) {
        console.error("⚠️ Error saving interview:", error);
    }
}

document.getElementById("uploadResume").addEventListener("click", async () => {
    const fileInput = document.getElementById("resumeInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a resume file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
        const response = await fetch("http://localhost:8800/api/upload-resume", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("📡 Full Upload Response:", result); // ✅ Log full response
        console.log("fileUrl:", result.fileUrl); // ✅ Check if fileUrl exists

        if (response.ok) {
            alert("✅ Resume uploaded successfully!");
            // analyzeResume(result.fileUrl);

            // 🔥 FIXED: Call analyzeResume with the returned fileKey or S3 URL
            // if (result.fileKey) {
            //     // analyzeResume(result.fileUrl);
            // } else {
            //     console.error("⚠️ Missing fileKey or s3Url in response: ", result);
            //     alert("❌ Resume uploaded but cannot analyze (missing fileKey).");
            // }
        } else {
            alert("❌ Failed to upload resume. Try again.");
        }
    } catch (error) {
        console.error("⚠️ Error uploading resume:", error);
        alert("❌ Error uploading resume.");
    }
});

// Function to analyze the uploaded resume
// Function to analyze the uploaded resume
// async function analyzeResume(fileUrl) {
//     console.log("📤 Sending resume for analysis:", fileUrl);

//     if (!fileUrl) {
//         console.error("❌ Missing fileUrl!");
//         alert("❌ Resume analysis failed (missing fileUrl).");
//         return;
//     }

//     // Extract file key from URL
//     const fileKey = fileUrl.split("/").pop(); // Extracts "resume.pdf"

//     try {
//         const response = await fetch("http://localhost:8800/api/analyze-resume", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ fileUrl })  // ✅ Send fileUrl instead of fileKey
//         });

//         const result = await response.json();
//         console.log("📝 Resume Analysis Response:", result);

//         if (response.ok) {
//             // ✅ Show AI analysis results on the page
//             document.getElementById("resumeAnalysis").innerHTML = 
//                 <h3>📄 Resume Analysis</h3>
//                 <p><b>Extracted Text:</b> ${result.text?.substring(0, 500) || "N/A"}...</p>
//                 <p><b>Detected Skills:</b> ${result.basicAnalysis?.skills?.join(", ") || "None detected"}</p>
//                 <p><b>Basic Score:</b> ${result.basicAnalysis?.score || "0"}%</p>
//                 <p><b>AI Analysis:</b> ${result.aiAnalysis || "N/A"}</p>
//             ;
//         } else {
//             alert("❌ Failed to analyze resume!");
//         }
//     } catch (error) {
//         console.error("⚠️ Error analyzing resume:", error);
//         alert("❌ Error analyzing resume");
//     }
// }

// async function analyzeInterview(s3Url) {
//     try {
//         const response = await fetch("http://localhost:8800/api/analyze-interview/analyze", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ s3Url }),
//         });

//         const data = await response.json();
//         if (data.transcript) {
//             document.getElementById("transcript").innerText = "Transcript: " + data.transcript;
//             document.getElementById("score").innerText = "Score: " + data.score;
//             document.getElementById("feedback").innerText = "Feedback: " + data.feedback;
//         } else {
//             console.error("Error:", data.error);
//         }
//     } catch (error) {
//         console.error("Analysis failed:", error);
//     }
// }

// 8️⃣ Start Interview on Page Load (Optional)
window.onload = () => {
    startBtn.disabled = false;
    stopBtn.disabled = false;
};