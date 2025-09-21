class TTSService {
  constructor() {
    this.initialized = false;
    this.voices = [];
    this.currentVoice = 'en_US-amy-medium';
    this.storedVoices = [];
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Simulate getting available voices
      this.voices = [
        { key: 'en_US-amy-medium', name: 'Amy', language: 'en-US', quality: 'medium' },
        { key: 'en_US-kathleen-medium', name: 'Kathleen', language: 'en-US', quality: 'medium' },
        { key: 'en_US-kristin-medium', name: 'Kristin', language: 'en-US', quality: 'medium' }
      ];
      
      // Simulate getting stored voices
      this.storedVoices = [];
      
      this.initialized = true;
      console.log('TTS service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TTS service:', error);
    }
  }

  async downloadVoice(voiceId, progressCallback) {
    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (progressCallback) {
          progressCallback({ loaded: i, total: 100 });
        }
      }
      
      this.storedVoices.push(voiceId);
      return true;
    } catch (error) {
      console.error('Failed to download voice:', error);
      return false;
    }
  }

  async speak(text, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const {
      voiceId = this.currentVoice,
      speed = 1.0,
      pitch = 1.0,
      onProgress = null
    } = options;
    
    try {
      // Check if voice is downloaded
      if (!this.storedVoices.includes(voiceId)) {
        const downloaded = await this.downloadVoice(voiceId);
        if (!downloaded) {
          throw new Error('Voice download failed');
        }
      }
      
      // Simulate TTS generation
      const audio = new Audio();
      // Create a simple tone for demonstration
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1);
      
      return audio;
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  }
}

class WebSpeechTTSService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synthesis.getVoices();
        
        // Filter for female voices
        this.voices = this.voices.filter(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('girl') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.lang.includes('en') && (
            voice.name.toLowerCase().includes('google') ||
            voice.name.toLowerCase().includes('microsoft')
          )
        );
        
        if (this.voices.length > 0) {
          this.currentVoice = this.voices[0];
        }
        
        this.initialized = true;
        resolve();
      };
      
      loadVoices();
      
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = loadVoices;
      }
    });
  }

  async speak(text, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const {
      voice = this.currentVoice,
      rate = 1.1,
      pitch = 1.2,
      volume = 1.0,
      onEnd = null
    } = options;
    
    return new Promise((resolve, reject) => {
      if (this.synthesis.speaking) {
        this.synthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      utterance.onend = () => {
        if (onEnd) onEnd();
        resolve();
      };
      
      utterance.onerror = (error) => {
        reject(error);
      };
      
      this.synthesis.speak(utterance);
    });
  }
}

class CoquiTTSService {
  constructor() {
    this.serverUrl = 'http://localhost:5002';
    this.initialized = false;
  }

  async initialize() {
    // Check if server is available
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      if (response.ok) {
        this.initialized = true;
        console.log('Coqui TTS service initialized');
      }
    } catch (error) {
      console.error('Coqui TTS server not available:', error);
    }
  }

  async speak(text, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.initialized) {
      throw new Error('Coqui TTS service not available');
    }
    
    const {
      speakerWav = null,
      language = 'en'
    } = options;
    
    try {
      const response = await fetch(`${this.serverUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          speaker_wav: speakerWav,
          language
        }),
      });
      
      if (!response.ok) {
        throw new Error('Coqui TTS request failed');
      }
      
      const blob = await response.blob();
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      
      return audio;
    } catch (error) {
      console.error('Coqui TTS generation failed:', error);
      throw error;
    }
  }
}

class RVCTTSService {
  constructor() {
    this.serverUrl = 'http://localhost:8001';
    this.initialized = false;
  }

  async initialize() {
    // Check if server is available
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      if (response.ok) {
        this.initialized = true;
        console.log('RVC TTS service initialized');
      }
    } catch (error) {
      console.error('RVC TTS server not available:', error);
    }
  }

  async sing(text, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.initialized) {
      throw new Error('RVC TTS service not available');
    }
    
    const {
      pitch = 0,
      ttsRate = 0,
      ttsVolume = 0,
      indexRate = 0.75,
      f0Method = 'rmvpe'
    } = options;
    
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('pitch', pitch.toString());
      formData.append('tts_rate', ttsRate.toString());
      formData.append('tts_volume', ttsVolume.toString());
      formData.append('index_rate', indexRate.toString());
      formData.append('f0_method', f0Method);
      
      const response = await fetch(`${this.serverUrl}/sing`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('RVC TTS request failed');
      }
      
      const blob = await response.blob();
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      
      return audio;
    } catch (error) {
      console.error('RVC TTS generation failed:', error);
      throw error;
    }
  }
}

// Export service instances
export const piperTTSService = new TTSService();
export const webSpeechTTSService = new WebSpeechTTSService();
export const coquiTTSService = new CoquiTTSService();
export const rvcTTSService = new RVCTTSService();

// Service manager
export class TTSServiceManager {
  constructor() {
    this.services = {
      piper: piperTTSService,
      webSpeech: webSpeechTTSService,
      coqui: coquiTTSService,
      rvc: rvcTTSService
    };
    this.currentService = 'piper';
  }

  async speak(text, options = {}) {
    const service = this.services[this.currentService];
    return await service.speak(text, options);
  }

  async sing(text, options = {}) {
    const service = this.services.rvc;
    return await service.sing(text, options);
  }

  setService(serviceName) {
    if (this.services[serviceName]) {
      this.currentService = serviceName;
    }
  }

  async initializeAll() {
    for (const serviceName in this.services) {
      try {
        await this.services[serviceName].initialize();
      } catch (error) {
        console.error(`Failed to initialize ${serviceName} service:`, error);
      }
    }
  }
}

export const ttsServiceManager = new TTSServiceManager();
