import React, { useState } from 'react';
import Scene3D from './Scene3D.jsx';
import FileUpload from './FileUpload.jsx';
import AvatarController from './AvatarController.jsx';
import WebLLMAIController from './WebLLMAIController.jsx';
import TTSController from './TTSController.jsx';
import WebSpeechTTS from './WebSpeechTTS.jsx';
import CoquiTTS from './CoquiTTS.jsx';
import SingingController from './SingingController.jsx';
import MusicNoteDetector from './MusicNoteDetector.jsx';
import AutoVoiceController from './AutoVoiceController.jsx';
import VoiceIntensityAnalyzer from './VoiceIntensityAnalyzer.jsx';
import VoiceTriggerSystem from './VoiceTriggerSystem.jsx';
import AIVoiceDecisionMaker from './AIVoiceDecisionMaker.jsx';
import { useAvatarStore } from '../store/avatarStore.js';

const AvatarViewer = () => {
  const [activeTab, setActiveTab] = useState('controls');
  const { model, isLoading } = useAvatarStore();

  const builtInModels = [
    {
      name: "Default Character",
      url: "/models/default-character.glb",
      type: "character",
      description: "A basic 3D character model"
    },
    {
      name: "Anime Girl",
      url: "/models/anime-girl.glb", 
      type: "character",
      description: "Anime-style female character"
    },
    {
      name: "Robot Avatar",
      url: "/models/robot-avatar.glb",
      type: "character", 
      description: "Futuristic robot character"
    }
  ];

  const tabs = [
    { id: 'controls', label: 'Controls', icon: '🎮' },
    { id: 'ai', label: 'AI Control', icon: '🤖' },
    { id: 'voice', label: 'Voice', icon: '🎤' },
    { id: 'singing', label: 'Singing', icon: '🎵' },
    { id: 'auto', label: 'Auto Voice', icon: '⚡' },
    { id: 'analysis', label: 'Analysis', icon: '📊' }
  ];

  const handleFileLoad = (url, filename) => {
    // This would be handled by the store
    console.log('File loaded:', url, filename);
  };

  const handleBuiltInModelSelect = (index) => {
    const model = builtInModels[index];
    console.log('Selected model:', model);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Jena AI VTuber</h1>
              <p className="text-sm text-slate-400">3D Avatar Control System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${model ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-slate-300">
                {model ? 'Model Loaded' : 'No Model'}
              </span>
            </div>
            
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <Scene3D />
        </div>

        {/* Control Panel */}
        <div className="w-96 bg-slate-800/30 backdrop-blur-sm border-l border-slate-700/50 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'controls' && (
              <>
                <FileUpload 
                  onFileLoad={handleFileLoad}
                  onLoadingChange={(loading) => console.log('Loading:', loading)}
                  builtInModels={builtInModels}
                  onBuiltInModelSelect={handleBuiltInModelSelect}
                  currentModelIndex={0}
                />
                <AvatarController currentModel={model} />
              </>
            )}

            {activeTab === 'ai' && (
              <WebLLMAIController />
            )}

            {activeTab === 'voice' && (
              <div className="space-y-4">
                <TTSController />
                <WebSpeechTTS />
                <CoquiTTS />
              </div>
            )}

            {activeTab === 'singing' && (
              <div className="space-y-4">
                <SingingController />
                <MusicNoteDetector />
              </div>
            )}

            {activeTab === 'auto' && (
              <div className="space-y-4">
                <AutoVoiceController />
                <VoiceTriggerSystem />
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <VoiceIntensityAnalyzer />
                <AIVoiceDecisionMaker />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarViewer;
