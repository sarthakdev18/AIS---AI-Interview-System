const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const speech = require('@google-cloud/speech');
const socketIoClient = require('socket.io-client');

// Backend setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Frontend setup
const frontendSocket = socketIoClient('');

// Middleware
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Backend socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming code and send to malicious activity detection
  socket.on('code', (code) => {
    // Perform malicious activity detection here
    const isMalicious = detectMaliciousActivity(code);

    if (isMalicious) {
      // Notify the user or take appropriate action
      socket.emit('malicious', 'Malicious activity detected!');
    } else {
      // Continue with the speech-to-text conversation
      const speechClient = new speech.SpeechClient();
      const request = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        audio: {
          content: socket.handshake.query.audio, // You need to handle audio streaming
        },
      };

      // Recognize speech and send questions back to the user
      speechClient
        .recognize(request)
        .then((data) => {
          const question = processSpeechRecognition(data.results);
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

// Frontend socket connection
frontendSocket.on('connect', () => {
  console.log('Connected to frontend server');
});

frontendSocket.on('question', (question) => {
  // Handle received question from frontend
  console.log('Received question from frontend:', question);
});

frontendSocket.on('malicious', (message) => {
  // Handle malicious activity notification from frontend
  console.error('Malicious activity detected on frontend:', message);
});

// Function to detect malicious activity
function detectMaliciousActivity(code) {
  // Implement your malicious activity detection logic
  // Return true if malicious activity is detected, false otherwise
  return false; // Placeholder implementation
}

// Function to process speech recognition results
function processSpeechRecognition(results) {
  // Implement logic to convert speech recognition results to questions
  // You may use NLP libraries for a more sophisticated approach
  return 'What is the purpose of the code you just wrote?'; // Placeholder implementation
}

// Backend server setup
const PORT = process.env.PORT || 3000;
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
