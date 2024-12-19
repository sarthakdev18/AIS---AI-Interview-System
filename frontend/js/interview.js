
import {OpenAI} from 'openai';
import dotenv from 'dotenv';
dotenv.config()
// 2. Setup for OpenAI and keyword detection.
const openai = new OpenAI(
    apiKey= process.env.OPENAI_API_KEY,

);
const keyword = "gpt";
// 3. Initial microphone setup.
let micInstance = mic({ rate: '16000', channels: '1', debug: false, exitOnSilence: 6 });
let micInputStream = micInstance.getAudioStream();
let isRecording = false;
let audioChunks = [];

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const outputTextarea = document.getElementById('output');
const chatHistory = []; 
let recognition;

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log('Speech recognition started');
        startButton.disabled = true;
        stopButton.disabled = false;
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        outputTextarea.value += transcript;
    };

    /*
    recognition.onend = () => {
        console.log('Speech recognition ended');
        startButton.disabled = false;
        stopButton.disabled = true;
    };
    */

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    startButton.addEventListener('click', () => {
        recognition.start();
    });

    stopButton.addEventListener('click', () => {
        console.log('Speech recognition ended');
        recognition.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
        // const result = getOpenAIResponse(outputTextarea.value);
        const result = getResponse("Hi my name is Sarthak");
        console.log(result);
        console.log("Function end");
        
    });
} else {
    console.error('Speech recognition not supported in this browser');
    startButton.disabled = true;
    stopButton.disabled = true;
}

const getResponse = async userInput =>{
    try {
        const messages = chatHistory.map(([role, content]) => ({
          role,
          content,
        }));
  
        // Add latest user input
        messages.push({ role: 'user', content: userInput });
  
        // Call the API with user input & history
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
        });
  
        // Get completion text/content
        const completionText = completion.data.choices[0].message.content;
  
        if (userInput.toLowerCase() === 'exit') {
          console.log(colors.green('Bot: ') + completionText);
          return;
        }
  
        console.log(colors.green('Bot: ') + completionText);
  
        // Update history with user input and assistant response
        chatHistory.push(['user', userInput]);
        chatHistory.push(['assistant', completionText]);
        return completionText;
      } catch (error) {
        console.error(colors.red(error));
      }
}



// 8. Communicate with OpenAI.
const getOpenAIResponse =  message => {
    console.log("Communicating with OpenAI...");
    const chat = new ChatOpenAI();
    const response =  chat.call([
        new SystemMessage("You are an AI Interviewer and conducting an interview."),
        new HumanMessage(message),
    ]);
    return response.text;
};
// 9. Convert response to audio using Eleven Labs.
// const convertResponseToAudio = async text => {
//     const apiKey = process.env.ELEVEN_LABS_API_KEY;
//     const voiceID = "pNInz6obpgDQGcFmaJgB";
//     const fileName = `${Date.now()}.mp3`;
//     console.log("Converting response to audio...");
//     const audioStream = await voice.textToSpeechStream(apiKey, voiceID, text);
//     const fileWriteStream = fs.createWriteStream('./audio/' + fileName);
//     audioStream.pipe(fileWriteStream);
//     return new Promise((resolve, reject) => {
//         fileWriteStream.on('finish', () => {
//             console.log("Audio conversion done...");
//             resolve(fileName);
//         });
//         audioStream.on('error', reject);
//     });
// };
// 10. Start the application and keep it alive.
// startRecordingProcess();
// process.stdin.resume();