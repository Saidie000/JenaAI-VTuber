import React, { useEffect, useState } from 'react';
import AvatarViewer from './components/AvatarViewer.jsx';
import GameController from './components/GameController.jsx';
import GameLauncher from './components/GameLauncher.jsx';
import VRChatIntegration from './components/VRChatIntegration.jsx';
import ChatInterface from './components/ChatInterface.jsx';
import SystemStatus from './components/SystemStatus.jsx';
import ModuleDependencyManager from './components/ModuleDependencyManager.jsx';
import { useAvatarStore } from './store/avatarStore.js';
import { virtualInputSystem } from './services/virtualInputSystem.js';
import { vrTrackingSystem } from './services/vrTrackingSystem.js';
import { moduleStatePersistence } from './services/moduleStatePersistence.js';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentView, setCurrentView] = useState('avatar');
  const { loadFromIndexedDB } = useAvatarStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load data from IndexedDB
        await loadFromIndexedDB();
        
        // Initialize virtual input and VR tracking systems
        await virtualInputSystem.start();
        await vrTrackingSystem.start();
        
        setIsInitialized(true);
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadFromIndexedDB]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Avatar System...</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'avatar':
        return <AvatarViewer />;
      case 'games':
        return <GameController />;
      case 'launcher':
        return <GameLauncher />;
      case 'vrchat':
        return <VRChatIntegration />;
      case 'chat':
        return <ChatInterface />;
      case 'status':
        return <SystemStatus />;
      case 'modules':
        return <ModuleDependencyManager />;
      default:
        return <AvatarViewer />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <h1 className="text-xl font-bold text-white">Jena AI Control Center</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('avatar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'avatar'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Avatar
              </button>
              <button
                onClick={() => setCurrentView('games')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'games'
                    ? 'bg-green-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Games
              </button>
              <button
                onClick={() => setCurrentView('launcher')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'launcher'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Launcher
              </button>
              <button
                onClick={() => setCurrentView('vrchat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'vrchat'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                VRChat
              </button>
              <button
                onClick={() => setCurrentView('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'chat'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setCurrentView('status')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'status'
                    ? 'bg-yellow-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => setCurrentView('modules')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'modules'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Modules
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
