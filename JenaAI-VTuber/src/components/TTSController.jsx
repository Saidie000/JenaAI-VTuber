import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Volume2, Play, Pause, Download, Settings, Sparkles } from 'lucide-react';
import { piperTTSService } from '../services/ttsServices.js';

const TTSController = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('en_US-amy-medium');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [storedVoices, setStoredVoices] = useState([]);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  const audioRef = useRef(null);

  // Youthful female voice options
  const voiceOptions = [
    {
      id: 'en_US-amy-medium',
      name: 'Amy',
      language: 'English (US)',
      quality: 'medium',
      gender: 'female',
      description: 'Natural, youthful female voice - clear and energetic'
    },
    {
      id: 'en_US-kathleen-medium',
      name: 'Kathleen',
      language: 'English (US)',
      quality: 'medium',
      gender: 'female',
      description: 'Warm, friendly female voice with youthful tone'
    },
    {
      id: 'en_US-kristin-medium',
      name: 'Kristin',
      language: 'English (US)',
      quality: 'medium',
      gender: 'female',
      description: 'Bright, cheerful female voice - perfect for energetic speech'
    }
  ];

  // Initialize TTS
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        await piperTTSService.initialize();
        setAvailableVoices(voiceOptions);
        setStoredVoices(piperTTSService.storedVoices);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing TTS:', error);
      }
    };

    initializeTTS();
  }, []);

  // Download voice model
  const downloadVoice = async (voiceId) => {
    setIsDownloading(true);
    setDownloadProgress('Starting download...');

    try {
      await piperTTSService.downloadVoice(voiceId, (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setDownloadProgress(`Downloading: ${percent}%`);
      });

      setDownloadProgress('Download complete!');
      
      // Refresh stored voices
      setStoredVoices(piperTTSService.storedVoices);
    } catch (error) {
      console.error('Error downloading voice:', error);
      setDownloadProgress('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  // Convert text to speech
  const speakText = async () => {
    if (!textToSpeak.trim() || isSpeaking) return;

    setIsSpeaking(true);

    try {
      // Check if voice is downloaded
      if (!storedVoices.includes(selectedVoice)) {
        await downloadVoice(selectedVoice);
      }

      // Generate speech
      const audio = await piperTTSService.speak(textToSpeak, {
        voiceId: selectedVoice,
        speed: speechRate,
        pitch: pitch
      });

      // Play audio
      if (audioRef.current) {
        audioRef.current.src = audio.src;
        audioRef.current.playbackRate = speechRate;
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
        };

        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  // Stop speech
  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-pink-400" />
          Youthful Female Voice TTS
          {isInitialized && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 ml-auto">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div>
          <label className="text-sm text-slate-300 mb-2 block">Select Voice</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {voiceOptions.map((voice) => (
                <SelectItem key={voice.id} value={voice.id} className="text-white">
                  <div>
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs text-slate-400">{voice.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Status */}
        <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
          <div>
            <span className="text-sm text-slate-300">
              {storedVoices.includes(selectedVoice) ? 'Voice Ready' : 'Voice Not Downloaded'}
            </span>
          </div>
          <div>
            {storedVoices.includes(selectedVoice) ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => downloadVoice(selectedVoice)}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-3 h-3 mr-1" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            )}
          </div>
        </div>

        {/* Download Progress */}
        {downloadProgress && (
          <div className="text-center">
            <p className="text-sm text-slate-400">{downloadProgress}</p>
          </div>
        )}

        {/* Speech Controls */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Speech Rate</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Slow</span>
              <span>{speechRate}x</span>
              <span>Fast</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Text to Speak</label>
            <Textarea
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Enter text for the avatar to speak..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={speakText}
              disabled={!textToSpeak.trim() || isSpeaking || !storedVoices.includes(selectedVoice)}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {isSpeaking ? 'Speaking...' : 'Speak'}
            </Button>
            {isSpeaking && (
              <Button
                onClick={stopSpeech}
                variant="outline"
                className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30"
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Phrases */}
        <div>
          <label className="text-sm text-slate-300 mb-2 block">Quick Phrases</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Hello! I'm so happy to meet you!",
              "That's really interesting, tell me more!",
              "I love learning new things every day!",
              "You're awesome! Thanks for being here.",
              "Let's have some fun together!",
              "I'm excited to chat with you!"
            ].map((phrase, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setTextToSpeak(phrase)}
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 text-xs"
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
    </Card>
  );
};

export default TTSController;
