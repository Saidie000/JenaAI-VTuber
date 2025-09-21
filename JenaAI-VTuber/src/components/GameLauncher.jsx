import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Download, 
  Monitor, 
  Headphones, 
  Gamepad2,
  Mouse,
  Keyboard,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { virtualInputSystem } from '../services/virtualInputSystem.js';
import { vrTrackingSystem } from '../services/vrTrackingSystem.js';

const GameLauncher = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStatus, setGameStatus] = useState({});
  const [inputMode, setInputMode] = useState('keyboard');
  const [vrMode, setVrMode] = useState(false);
  const [recordingMode, setRecordingMode] = useState(false);
  
  const gameRef = useRef(null);
  const inputIntervalRef = useRef(null);

  const games = {
    minecraft: {
      name: 'Minecraft',
      icon: '🧱',
      description: 'Build, explore, and survive in the blocky world',
      category: 'sandbox',
      vrSupport: true,
      inputModes: ['keyboard', 'mouse', 'gamepad'],
      controls: {
        keyboard: {
          'W': 'Move Forward',
          'S': 'Move Backward',
          'A': 'Move Left',
          'D': 'Move Right',
          'Space': 'Jump',
          'Shift': 'Sneak',
          'Ctrl': 'Sprint',
          'E': 'Inventory',
          'Tab': 'Player List',
          '1-9': 'Hotbar Slots'
        },
        mouse: {
          'Left Click': 'Attack/Place',
          'Right Click': 'Use/Interact',
          'Middle Click': 'Pick Block',
          'Scroll': 'Change Hotbar Slot'
        },
        gamepad: {
          'Left Stick': 'Movement',
          'Right Stick': 'Camera',
          'A': 'Jump',
          'B': 'Sneak',
          'X': 'Inventory',
          'Y': 'Chat',
          'Left Trigger': 'Attack',
          'Right Trigger': 'Use'
        }
      },
      launchCommand: 'minecraft://',
      executable: 'minecraft.exe'
    },
    osu: {
      name: 'Osu!',
      icon: '🎵',
      description: 'Rhythm game with circles, sliders, and spinners',
      category: 'rhythm',
      vrSupport: false,
      inputModes: ['keyboard', 'mouse'],
      controls: {
        keyboard: {
          'Z': 'Left Click',
          'X': 'Right Click',
          'Space': 'Pause',
          'Esc': 'Menu',
          'F1': 'Skip Intro',
          'F2': 'Restart'
        },
        mouse: {
          'Left Click': 'Hit Circle',
          'Right Click': 'Hit Circle',
          'Middle Click': 'Pause',
          'Scroll': 'Volume'
        }
      },
      launchCommand: 'osu://',
      executable: 'osu!.exe'
    },
    vrchat: {
      name: 'VRChat',
      icon: '🥽',
      description: 'Social VR platform with custom avatars',
      category: 'social',
      vrSupport: true,
      inputModes: ['vr', 'keyboard', 'mouse'],
      controls: {
        vr: {
          'Left Controller': 'Movement & Interaction',
          'Right Controller': 'Camera & Gestures',
          'Voice': 'Chat & Communication',
          'Gestures': 'Avatar Expressions'
        },
        keyboard: {
          'WASD': 'Movement',
          'Mouse': 'Camera',
          'Space': 'Jump',
          'Shift': 'Crouch',
          'T': 'Chat',
          'V': 'Voice Toggle'
        },
        mouse: {
          'Left Click': 'Interact',
          'Right Click': 'Menu',
          'Scroll': 'Zoom'
        }
      },
      launchCommand: 'vrchat://',
      executable: 'VRChat.exe'
    },
    steam: {
      name: 'Steam Games',
      icon: '🎮',
      description: 'Launch any Steam game with custom controls',
      category: 'platform',
      vrSupport: true,
      inputModes: ['keyboard', 'mouse', 'gamepad', 'vr'],
      controls: {
        keyboard: 'Customizable per game',
        mouse: 'Customizable per game',
        gamepad: 'Customizable per game',
        vr: 'VR Controller support'
      },
      launchCommand: 'steam://',
      executable: 'steam.exe'
    }
  };

  const categories = {
    sandbox: { name: 'Sandbox', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
    rhythm: { name: 'Rhythm', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
    social: { name: 'Social', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    platform: { name: 'Platform', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
  };

  useEffect(() => {
    initializeSystem();
    return () => {
      if (inputIntervalRef.current) {
        clearInterval(inputIntervalRef.current);
      }
    };
  }, []);

  const initializeSystem = async () => {
    try {
      await virtualInputSystem.start();
      await vrTrackingSystem.start();
      console.log('Game launcher initialized');
    } catch (error) {
      console.error('Failed to initialize game launcher:', error);
    }
  };

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
    setGameStatus({});
  };

  const handleLaunchGame = async () => {
    if (!selectedGame) return;
    
    const game = games[selectedGame];
    setIsPlaying(true);
    setGameStatus({ status: 'launching', message: `Launching ${game.name}...` });
    
    try {
      // Simulate game launch
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGameStatus({ 
        status: 'running', 
        message: `${game.name} is running`,
        pid: Math.floor(Math.random() * 10000) + 1000
      });
      
      // Start input monitoring
      startInputMonitoring();
      
    } catch (error) {
      setGameStatus({ 
        status: 'error', 
        message: `Failed to launch ${game.name}` 
      });
      setIsPlaying(false);
    }
  };

  const handleStopGame = () => {
    setIsPlaying(false);
    setGameStatus({ status: 'stopped', message: 'Game stopped' });
    
    if (inputIntervalRef.current) {
      clearInterval(inputIntervalRef.current);
    }
  };

  const startInputMonitoring = () => {
    inputIntervalRef.current = setInterval(() => {
      // Monitor input and send to game
      const inputStatus = virtualInputSystem.getStatus();
      console.log('Input monitoring:', inputStatus);
    }, 100);
  };

  const handleInputModeChange = (mode) => {
    setInputMode(mode);
    console.log(`Switched to ${mode} input mode`);
  };

  const handleVRModeToggle = () => {
    setVrMode(!vrMode);
    if (!vrMode) {
      vrTrackingSystem.start();
    } else {
      vrTrackingSystem.stop();
    }
  };

  const handleRecordingToggle = () => {
    setRecordingMode(!recordingMode);
    console.log(`Recording mode: ${!recordingMode ? 'ON' : 'OFF'}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'launching':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Square className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'launching':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const renderGameList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(games).map(([gameId, game]) => (
        <Card 
          key={gameId}
          className={`cursor-pointer transition-all duration-200 ${
            selectedGame === gameId
              ? 'bg-blue-600/20 border-blue-500/50 shadow-lg'
              : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70'
          }`}
          onClick={() => handleGameSelect(gameId)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{game.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{game.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{game.description}</p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={categories[game.category].color}
                  >
                    {categories[game.category].name}
                  </Badge>
                  {game.vrSupport && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      VR
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderGameDetails = () => {
    if (!selectedGame) return null;
    
    const game = games[selectedGame];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{game.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{game.name}</h2>
            <p className="text-slate-400">{game.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Game Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(gameStatus.status)}
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(gameStatus.status)}
                  >
                    {gameStatus.status || 'Not Running'}
                  </Badge>
                </div>
              </div>
              
              {gameStatus.message && (
                <div className="text-sm text-slate-400">
                  {gameStatus.message}
                </div>
              )}
              
              {gameStatus.pid && (
                <div className="text-sm text-slate-400">
                  Process ID: {gameStatus.pid}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handleLaunchGame}
                  disabled={isPlaying}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Launch Game
                </Button>
                
                <Button
                  onClick={handleStopGame}
                  disabled={!isPlaying}
                  variant="outline"
                  className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Game
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Input Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Input Mode</label>
                <Tabs value={inputMode} onValueChange={handleInputModeChange}>
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="keyboard" className="text-slate-300 data-[state=active]:bg-blue-600">
                      <Keyboard className="w-4 h-4 mr-1" />
                      Keyboard
                    </TabsTrigger>
                    <TabsTrigger value="mouse" className="text-slate-300 data-[state=active]:bg-blue-600">
                      <Mouse className="w-4 h-4 mr-1" />
                      Mouse
                    </TabsTrigger>
                    <TabsTrigger value="gamepad" className="text-slate-300 data-[state=active]:bg-blue-600">
                      <Gamepad2 className="w-4 h-4 mr-1" />
                      Gamepad
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">VR Mode</span>
                <Button
                  onClick={handleVRModeToggle}
                  variant="outline"
                  className={`${vrMode ? 'bg-purple-600/20 border-purple-600/30 text-purple-400' : 'bg-slate-700 border-slate-600 text-white'} hover:bg-slate-600`}
                >
                  {vrMode ? <Headphones className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                  {vrMode ? 'VR Mode' : 'Desktop Mode'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Recording Mode</span>
                <Button
                  onClick={handleRecordingToggle}
                  variant="outline"
                  className={`${recordingMode ? 'bg-red-600/20 border-red-600/30 text-red-400' : 'bg-slate-700 border-slate-600 text-white'} hover:bg-slate-600`}
                >
                  {recordingMode ? 'Stop' : 'Start'} Recording
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={inputMode} onValueChange={handleInputModeChange}>
              <TabsList className="grid w-full grid-cols-3 bg-slate-700 mb-4">
                <TabsTrigger value="keyboard" className="text-slate-300 data-[state=active]:bg-blue-600">
                  Keyboard
                </TabsTrigger>
                <TabsTrigger value="mouse" className="text-slate-300 data-[state=active]:bg-blue-600">
                  Mouse
                </TabsTrigger>
                <TabsTrigger value="gamepad" className="text-slate-300 data-[state=active]:bg-blue-600">
                  Gamepad
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={inputMode} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(game.controls[inputMode] || {}).map(([key, action]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                      <span className="font-mono text-sm text-slate-300">{key}</span>
                      <span className="text-sm text-slate-400">{action}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Game Launcher</h1>
          <p className="text-slate-400">Launch and control games with Jena AI</p>
        </div>
        
        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="games" className="text-slate-300 data-[state=active]:bg-blue-600">
              Game Library
            </TabsTrigger>
            <TabsTrigger value="details" className="text-slate-300 data-[state=active]:bg-blue-600">
              Game Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="games">
            {renderGameList()}
          </TabsContent>
          
          <TabsContent value="details">
            {renderGameDetails()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GameLauncher;
