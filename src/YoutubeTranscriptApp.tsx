import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function YoutubeTranscriptApp() {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/youtubeTranscribeHandler', { url, model });
      setTranscript(response.data.transcript);
    } catch (error) {
      console.error('Error:', error);
      setTranscript('An error occurred while fetching the transcript.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-background rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">YouTube Telugu Transcription</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="youtube-link" className="block text-sm font-medium mb-1">
            YouTube Video Link
          </label>
          <Input
            id="youtube-link"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="model-select" className="block text-sm font-medium mb-1">
            Translation Model
          </label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Transcribing...' : 'Get Transcript'}
        </Button>
      </form>
      {transcript && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Transcript:</h2>
          <Textarea
            value={transcript}
            readOnly
            className="w-full h-48"
          />
        </div>
      )}
    </div>
  );
}