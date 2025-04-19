const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { TranscribeClient, StartTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
require("dotenv").config();

// Backend setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Frontend setup
const frontendSocket = require('socket.io-client')('http://localhost:8000');  // Set the correct URL for frontend

// Middleware
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index1.html');
});

// Initialize AWS Transcribe Client (v3)
const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming code and send to malicious activity detection
  socket.on('code', (code) => {
    const isMalicious = detectMaliciousActivity(code);

    if (isMalicious) {
      socket.emit('malicious', 'Malicious activity detected!');
    } else {
      // Assuming the client sends audio URL or Base64 encoded audio data
      const audioData = socket.handshake.query.audio;

      // Send audio to AWS Transcribe service for speech-to-text
      startTranscriptionJob(audioData)
        .then((question) => {
          socket.emit('question', question);
        })
        .catch((error) => {
          console.error('Error recognizing speech:', error);
        });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Function to detect malicious activity in the code
function detectMaliciousActivity(code) {
  // Implement your malicious activity detection logic
  return false;
}

// Function to start transcription using AWS Transcribe service
async function startTranscriptionJob(audioData) {
  const params = {
    LanguageCode: 'en-US',
    MediaFormat: 'mp3',  // Assuming the audio is in mp3 format
    Media: { MediaFileUri: audioData },  // The URL of the audio file in S3
    TranscriptionJobName: `job-${Date.now()}`,
  };

  const command = new StartTranscriptionJobCommand(params);

  try {
    const data = await transcribeClient.send(command);
    // Here you would typically handle the transcription result
    console.log('Transcription job started:', data);
    // Return a question based on the transcription result (you can process the response here)
    return 'What is the purpose of the code you just wrote?';  // Placeholder
  } catch (error) {
    console.error('Error starting transcription job:', error);
    throw error;
  }
}

// Frontend socket connection handling
frontendSocket.on('connect', () => {
  console.log('Connected to frontend server');
});

frontendSocket.on('question', (question) => {
  console.log('Received question from frontend:', question);
});

frontendSocket.on('malicious', (message) => {
  console.error('Malicious activity detected on frontend:', message);
});

// Backend server setup
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
