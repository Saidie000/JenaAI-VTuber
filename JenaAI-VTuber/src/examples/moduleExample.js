/**
 * Example Module with Dependencies and State Persistence
 * Demonstrates how to create modules that work with the enhanced module system
 */

// Example: TTS Module with dependencies
export const ttsModule = {
  id: 'tts-module',
  name: 'Text-to-Speech Module',
  version: '1.2.0',
  dependencies: ['audio-module', 'voice-module'], // Depends on other modules
  
  // Module initialization
  init: async function(options = {}) {
    console.log('Initializing TTS Module...');
    this.voices = [];
    this.currentVoice = null;
    this.isSpeaking = false;
    this.volume = options.volume || 1.0;
    this.rate = options.rate || 1.0;
    
    // Initialize TTS engine
    await this.initializeTTS();
    
    console.log('TTS Module initialized');
  },
  
  // Module cleanup
  destroy: async function() {
    console.log('Destroying TTS Module...');
    this.stopSpeaking();
    this.voices = [];
    this.currentVoice = null;
    console.log('TTS Module destroyed');
  },
  
  // Module update (hot-swap)
  update: async function(oldModule, newModule) {
    console.log('Updating TTS Module...');
    
    // Preserve current state
    this.voices = oldModule.voices || [];
    this.currentVoice = oldModule.currentVoice;
    this.isSpeaking = oldModule.isSpeaking || false;
    this.volume = oldModule.volume || 1.0;
    this.rate = oldModule.rate || 1.0;
    
    // Apply new configuration
    if (newModule.config) {
      Object.assign(this, newModule.config);
    }
    
    console.log('TTS Module updated');
  },
  
  // Save module state
  saveState: async function() {
    return {
      voices: this.voices,
      currentVoice: this.currentVoice,
      isSpeaking: this.isSpeaking,
      volume: this.volume,
      rate: this.rate,
      lastUsed: Date.now()
    };
  },
  
  // Restore module state
  restoreState: async function(state) {
    console.log('Restoring TTS Module state...');
    
    this.voices = state.voices || [];
    this.currentVoice = state.currentVoice;
    this.isSpeaking = state.isSpeaking || false;
    this.volume = state.volume || 1.0;
    this.rate = state.rate || 1.0;
    
    // Reinitialize if needed
    if (this.voices.length === 0) {
      await this.initializeTTS();
    }
    
    console.log('TTS Module state restored');
  },
  
  // Module functionality
  async initializeTTS() {
    // Simulate TTS initialization
    this.voices = [
      { id: 'voice1', name: 'Amy', language: 'en-US' },
      { id: 'voice2', name: 'Brian', language: 'en-GB' },
      { id: 'voice3', name: 'Emma', language: 'en-AU' }
    ];
    this.currentVoice = this.voices[0];
  },
  
  async speak(text) {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }
    
    console.log(`Speaking: "${text}" with voice ${this.currentVoice.name}`);
    this.isSpeaking = true;
    
    // Simulate speech
    setTimeout(() => {
      this.isSpeaking = false;
    }, text.length * 50); // Simulate speech duration
  },
  
  stopSpeaking() {
    this.isSpeaking = false;
    console.log('Speech stopped');
  },
  
  setVoice(voiceId) {
    const voice = this.voices.find(v => v.id === voiceId);
    if (voice) {
      this.currentVoice = voice;
      console.log(`Voice changed to ${voice.name}`);
    }
  },
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`Volume set to ${this.volume}`);
  },
  
  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(3, rate));
    console.log(`Rate set to ${this.rate}`);
  }
};

// Example: Audio Module (dependency)
export const audioModule = {
  id: 'audio-module',
  name: 'Audio Module',
  version: '1.0.0',
  dependencies: [], // No dependencies
  
  init: async function() {
    console.log('Initializing Audio Module...');
    this.audioContext = null;
    this.isInitialized = false;
    
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
      this.isInitialized = true;
    }
    
    console.log('Audio Module initialized');
  },
  
  destroy: async function() {
    console.log('Destroying Audio Module...');
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
    console.log('Audio Module destroyed');
  },
  
  saveState: async function() {
    return {
      isInitialized: this.isInitialized,
      sampleRate: this.audioContext?.sampleRate || 44100
    };
  },
  
  restoreState: async function(state) {
    console.log('Restoring Audio Module state...');
    this.isInitialized = state.isInitialized || false;
    
    if (state.isInitialized && !this.audioContext) {
      this.audioContext = new AudioContext();
    }
  }
};

// Example: Voice Module (dependency)
export const voiceModule = {
  id: 'voice-module',
  name: 'Voice Module',
  version: '1.1.0',
  dependencies: ['audio-module'], // Depends on audio module
  
  init: async function() {
    console.log('Initializing Voice Module...');
    this.voiceSettings = {
      pitch: 1.0,
      speed: 1.0,
      emphasis: 1.0
    };
    this.voiceHistory = [];
    
    console.log('Voice Module initialized');
  },
  
  destroy: async function() {
    console.log('Destroying Voice Module...');
    this.voiceSettings = null;
    this.voiceHistory = [];
    console.log('Voice Module destroyed');
  },
  
  saveState: async function() {
    return {
      voiceSettings: this.voiceSettings,
      voiceHistory: this.voiceHistory.slice(-10) // Keep last 10 entries
    };
  },
  
  restoreState: async function(state) {
    console.log('Restoring Voice Module state...');
    this.voiceSettings = state.voiceSettings || { pitch: 1.0, speed: 1.0, emphasis: 1.0 };
    this.voiceHistory = state.voiceHistory || [];
  },
  
  updateVoiceSettings(settings) {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
    console.log('Voice settings updated:', this.voiceSettings);
  },
  
  addToHistory(text, timestamp = Date.now()) {
    this.voiceHistory.push({ text, timestamp });
    if (this.voiceHistory.length > 100) {
      this.voiceHistory = this.voiceHistory.slice(-100);
    }
  }
};

// Example: Game Controller Module (depends on TTS and Voice)
export const gameControllerModule = {
  id: 'game-controller-module',
  name: 'Game Controller Module',
  version: '2.0.0',
  dependencies: ['tts-module', 'voice-module'], // Depends on TTS and Voice modules
  
  init: async function() {
    console.log('Initializing Game Controller Module...');
    this.currentGame = null;
    this.inputMode = 'keyboard';
    this.isRecording = false;
    this.recordedInputs = [];
    this.gameSettings = {};
    
    console.log('Game Controller Module initialized');
  },
  
  destroy: async function() {
    console.log('Destroying Game Controller Module...');
    this.stopRecording();
    this.currentGame = null;
    this.recordedInputs = [];
    this.gameSettings = {};
    console.log('Game Controller Module destroyed');
  },
  
  update: async function(oldModule, newModule) {
    console.log('Updating Game Controller Module...');
    
    // Preserve state
    this.currentGame = oldModule.currentGame;
    this.inputMode = oldModule.inputMode;
    this.isRecording = oldModule.isRecording;
    this.recordedInputs = oldModule.recordedInputs || [];
    this.gameSettings = oldModule.gameSettings || {};
    
    console.log('Game Controller Module updated');
  },
  
  saveState: async function() {
    return {
      currentGame: this.currentGame,
      inputMode: this.inputMode,
      isRecording: this.isRecording,
      recordedInputs: this.recordedInputs.slice(-50), // Keep last 50 inputs
      gameSettings: this.gameSettings,
      lastActivity: Date.now()
    };
  },
  
  restoreState: async function(state) {
    console.log('Restoring Game Controller Module state...');
    
    this.currentGame = state.currentGame;
    this.inputMode = state.inputMode || 'keyboard';
    this.isRecording = state.isRecording || false;
    this.recordedInputs = state.recordedInputs || [];
    this.gameSettings = state.gameSettings || {};
  },
  
  async startGame(gameName) {
    this.currentGame = gameName;
    console.log(`Starting game: ${gameName}`);
    
    // Use TTS module to announce game start
    const ttsModule = moduleSystem.getModule('tts-module');
    if (ttsModule) {
      await ttsModule.speak(`Starting ${gameName}`);
    }
  },
  
  stopGame() {
    console.log(`Stopping game: ${this.currentGame}`);
    this.currentGame = null;
    this.stopRecording();
  },
  
  startRecording() {
    this.isRecording = true;
    this.recordedInputs = [];
    console.log('Started recording inputs');
  },
  
  stopRecording() {
    this.isRecording = false;
    console.log(`Stopped recording. Captured ${this.recordedInputs.length} inputs`);
  },
  
  recordInput(input) {
    if (this.isRecording) {
      this.recordedInputs.push({
        ...input,
        timestamp: Date.now()
      });
    }
  },
  
  setInputMode(mode) {
    this.inputMode = mode;
    console.log(`Input mode changed to: ${mode}`);
  }
};

// Example usage of the module system
export async function exampleModuleUsage() {
  // Register modules
  moduleSystem.registerModule('audio-module', audioModule);
  moduleSystem.registerModule('voice-module', voiceModule);
  moduleSystem.registerModule('tts-module', ttsModule);
  moduleSystem.registerModule('game-controller-module', gameControllerModule);
  
  // Load modules (dependencies will be loaded automatically)
  await moduleSystem.loadModule('game-controller-module');
  
  // Use the modules
  const gameController = moduleSystem.getModule('game-controller-module');
  const tts = moduleSystem.getModule('tts-module');
  
  if (gameController && tts) {
    await gameController.startGame('Minecraft');
    await tts.speak('Welcome to Minecraft!');
    
    // Save states
    await moduleSystem.saveAllModuleStates();
    
    // Later, restore states
    await moduleSystem.restoreAllModuleStates();
  }
  
  // Create a state snapshot
  const snapshot = await moduleStatePersistence.createStateSnapshot(
    moduleSystem.modules,
    { metadata: { description: 'Game session snapshot' } }
  );
  
  console.log('Created snapshot:', snapshot);
}

// Export for use in other modules
export { moduleSystem } from '../services/moduleSystem.js';
export { moduleStatePersistence } from '../services/moduleStatePersistence.js';
