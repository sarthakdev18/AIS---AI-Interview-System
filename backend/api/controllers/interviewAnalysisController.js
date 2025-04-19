const { downloadFileFromS3, transcribeAudio } = require('../services/openaiTranscriptionService');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Analyzes an interview recording from AWS S3.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
async function analyzeInterview(req, res) {
  try {
    const { s3Key } = req.body; // Get the S3 key from the request body

    if (!s3Key) {
      return res.status(400).json({ error: 'S3 key is required' });
    }

    // 1. Download the interview file from S3
    const localFilePath = await downloadFileFromS3(s3Key);
    
    // 2. Transcribe the audio
    const transcription = await transcribeAudio(localFilePath);

    // 3. Analyze transcription using OpenAI GPT
    const analysis = await analyzeTextWithAI(transcription);

    res.json({ transcription, analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze interview' });
  }
}

/**
 * Sends transcription text to OpenAI GPT for analysis.
 * @param {string} text - Transcribed text from the interview.
 * @returns {Promise<string>} - AI analysis response.
 */
async function analyzeTextWithAI(text) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an AI interview evaluator. Provide constructive feedback on the interview.' },
          { role: 'user', content: text }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing text:', error.response?.data || error.message);
    throw new Error('Failed to analyze text.');
  }
}

module.exports = { analyzeInterview };