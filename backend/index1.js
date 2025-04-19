// 1. Importing required modules i.e. npm install mic sound-play wav stream openai langchain elevenlabs-node dotenv 
const mic = require('mic');
const sound = require('sound-play');
const { Writer } = require('wav');
const { Writable } = require('stream');
const fs = require('fs');
const { createWriteStream } = require('fs');
const OpenAI = require('openai');
const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const voice = require('elevenlabs-node');
require('dotenv').config();
// 2. Setup for OpenAI and keyword detection.
const openai = new OpenAI();
const keyword = "gpt";
// 3. Initial microphone setup.
let micInstance = mic({ rate: '16000', channels: '1', debug: false, exitOnSilence: 6 });
let micInputStream = micInstance.getAudioStream();
let isRecording = false;
let audioChunks = [];
// 4. Initiate recording.
const startRecordingProcess = () => {
    console.log("Starting listening process...");
    micInstance.stop();
    micInputStream.unpipe();
    micInstance = mic({ rate: '16000', channels: '1', debug: false, exitOnSilence: 10 });
    micInputStream = micInstance.getAudioStream();
    audioChunks = [];
    isRecording = true;
    micInputStream.pipe(new Writable({
        write(chunk, _, callback) {
            if (!isRecording) return callback();
            audioChunks.push(chunk);
            callback();
        }
    }));
    micInputStream.on('silence', handleSilence);
    micInstance.start();
};
// 5. Handle silence and detection.
const handleSilence = async () => {
    console.log("Detected silence...");
    if (!isRecording) return;
    isRecording = false;
    micInstance.stop();
    const audioFilename = await saveAudio(audioChunks);
    const message = await transcribeAudio(audioFilename);
    if (message && message.toLowerCase().includes(keyword)) {
        console.log("Keyword detected...");
        const responseText = await getOpenAIResponse(message);
        const fileName = await convertResponseToAudio(responseText);
        console.log("Playing audio...");
        await sound.play('./audio/' + fileName);
        console.log("Playback finished...");
    }
    startRecordingProcess();
};
// 6. Save audio.
const saveAudio = async audioChunks => {
    return new Promise((resolve, reject) => {
        console.log("Saving audio...");
        const audioBuffer = Buffer.concat(audioChunks);
        const wavWriter = new Writer({ sampleRate: 16000, channels: 1 });
        const filename = `${Date.now()}.wav`;
        const filePath = './audio/' + filename;
        wavWriter.pipe(createWriteStream(filePath));
        wavWriter.on('finish', () => {
            resolve(filename);
        });
        wavWriter.on('error', err => {
            reject(err);
        });
        wavWriter.end(audioBuffer);
    });
};
// 7. Transcribe audio.
const transcribeAudio = async filename => {
    console.log("Transcribing audio...");
    const audioFile = fs.createReadStream('./audio/' + filename);
    const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
    });
    return transcriptionResponse.text;
};
// 8. Communicate with OpenAI.
const getOpenAIResponse = async message => {
    console.log("Communicating with OpenAI...");
    const chat = new ChatOpenAI();
    const response = await chat.call([
        new SystemMessage("You are a helpful voice assistant"),
        new HumanMessage(message),
    ]);
    return response.text;
};
// 9. Convert response to audio using Eleven Labs.
async function getSpeechFromElevenLabs(text) {
    try {
        console.log("Sending request to Eleven Labs API...");
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': 'sk_6f0b0a4c0af099cedfeb87da64c5f48f834f105b8e223a76'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        console.log("Received audio response, playing...");

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();

    } catch (error) {
        console.error("Error fetching speech:", error);
    }
}
getSpeechFromElevenLabs("Hello, this is a test.");

// 10. Start the application and keep it alive.
startRecordingProcess();
process.stdin.resume();