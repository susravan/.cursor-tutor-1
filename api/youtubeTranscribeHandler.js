import { OpenAI } from 'openai';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { Readable, Writable } from 'stream';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function youtubeTranscribeHandler(req, res) {
  if (req.method === 'POST') {
    try {
      const { url, model } = req.body;
      
      // Download audio from YouTube
      const audioStream = ytdl(url, { quality: 'highestaudio' });
      
      // Convert audio to WAV format
      const audioBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        ffmpeg(audioStream)
          .toFormat('wav')
          .on('end', () => resolve(Buffer.concat(chunks)))
          .on('error', reject)
          .pipe(new Readable().wrap(new Writable({
            write(chunk, encoding, callback) {
              chunks.push(chunk);
              callback();
            }
          })));
      });

      // Transcribe audio using OpenAI's Whisper model
      const transcription = await openai.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1',
        language: 'te',
      });

      // Translate Telugu transcription to English using the specified model
      const translation = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that translates Telugu to English.' },
          { role: 'user', content: `Translate the following Telugu text to English: ${transcription.text}` }
        ],
      });

      res.status(200).json({ transcript: translation.choices[0].message.content });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred during transcription' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}