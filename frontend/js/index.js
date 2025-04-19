const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const socketIoClient = require('socket.io-client');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require('dotenv');
dotenv.config();

// AWS SDK Setup
const transcribeClient = new TranscribeClient({ region: 'eu-north-1' });
const s3Client = new S3Client({ region: 'eu-north-1' });
const bucketName = "my-ais-bucket";

// Backend setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Frontend setup
const frontendSocket = socketIoClient('');

const path = require("path");
app.use(express.static('public')); // Serve frontend files

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
}); 

// Backend socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('code', async (code) => {
    const isMalicious = detectMaliciousActivity(code);
    if (isMalicious) {
      socket.emit('malicious', 'Malicious activity detected!');
    } else {
      const audioFile = socket.handshake.query.audio;
      const fileName = `audio-${Date.now()}.mp3`;
      const filePath = `./uploads/${fileName}`;
      fs.writeFileSync(filePath, audioFile, 'base64');
      
      try {
        await uploadToS3(filePath, fileName);
        const question = await startTranscriptionJob(fileName);
        socket.emit('question', question);
      } catch (error) {
        console.error('Error processing transcription:', error);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

async function uploadToS3(filePath, fileName) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
  };
  await s3Client.send(new PutObjectCommand(uploadParams));
}

async function startTranscriptionJob(fileName) {
  const params = {
    TranscriptionJobName: `transcription-${Date.now()}`,
    LanguageCode: 'en-US',
    MediaFormat: 'mp3',
    Media: { MediaFileUri: `s3://${bucketName}/${fileName}` },
  };

  const command = new StartTranscriptionJobCommand(params);
  await transcribeClient.send(command);

  return checkTranscriptionStatus(params.TranscriptionJobName);
}

async function checkTranscriptionStatus(jobName) {
  return new Promise(async (resolve, reject) => {
    let jobComplete = false;
    while (!jobComplete) {
      await new Promise(res => setTimeout(res, 5000));
      const data = await transcribeClient.send(new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }));
      if (data.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
        jobComplete = true;
        resolve('What is the purpose of the code you just wrote?'); // Replace with real transcription data
      } else if (data.TranscriptionJob.TranscriptionJobStatus === 'FAILED') {
        reject('Transcription job failed');
      }
    }
  });
}

// Frontend socket connection
frontendSocket.on('connect', () => {
  console.log('Connected to frontend server');
});

frontendSocket.on('question', (question) => {
  console.log('Received question from frontend:', question);
});

frontendSocket.on('malicious', (message) => {
  console.error('Malicious activity detected on frontend:', message);
});

function detectMaliciousActivity(code) {
  return false;
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const speech = require('@google-cloud/speech');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static('public'));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Handle incoming code and send to malicious activity detection
//   socket.on('code', (code) => {
//     // Perform malicious activity detection here
//     const isMalicious = detectMaliciousActivity(code);

//     if (isMalicious) {
//       // Notify the user or take appropriate action
//       socket.emit('malicious', 'Malicious activity detected!');
//     } else {
//       // Continue with the speech-to-text conversation
//       const speechClient = new speech.SpeechClient();
//       const request = {
//         config: {
//           encoding: 'LINEAR16',
//           sampleRateHertz: 16000,
//           languageCode: 'en-US',
//         },
//         audio: {
//           content: socket.handshake.query.audio, // You need to handle audio streaming
//         },
//       };

//       // Recognize speech and send questions back to the user
//       speechClient.recognize(request)
//         .then((data) => {
//           const question = processSpeechRecognition(data.results);
//           socket.emit('question', question);
//         })
//         .catch((error) => {
//           console.error('Error recognizing speech:', error);
//         });
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });


// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
