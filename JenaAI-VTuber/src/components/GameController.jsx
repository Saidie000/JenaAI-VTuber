import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Gamepad2, 
  Mouse, 
  Keyboard, 
  Monitor, 
  Headphones, 
  Camera,
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';
import { virtualInputSystem } from '../services/virtualInputSystem.js';
import { vrTrackingSystem } from '../services/vrTrackingSystem.js';

const GameController = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedGame, setSelectedGame] = useState('minecraft');
  const [isPlaying, setIsPlaying] = useState(false);
  const [systemStatus, setSystemStatus] = useState({});
  const [vrStatus, setVrStatus] = useState({});
  const [inputMode, setInputMode] = useState('keyboard');
  const [recordingMode, setRecordingMode] = useState(false);
  
  const gamepadRef = useRef(null);
  const mouseRef = useRef(null);
  const keyboardRef = useRef(null);

  const games = {
    minecraft: {
      name: 'Minecraft',
      icon: '🧱',
      description: 'Build, explore, and survive in the blocky world',
      controls: ['WASD Movement', 'Mouse Look', 'Space Jump', 'Shift Sneak', 'E Inventory'],
      vrSupport: true
    },
    osu: {
      name: 'Osu!',
      icon: '🎵',
      description: 'Rhythm game with circles, sliders, and spinners',
      controls: ['Z/X Click', 'Mouse Movement', 'Space Pause', 'Esc Menu'],
      vrSupport: false
    },
    vrchat: {
      name: 'VRChat',
      icon: '🥽',
      description: 'Social VR platform with custom avatars',
      controls: ['VR Controllers', 'Voice Chat', 'Gestures', 'Expressions'],
      vrSupport: true
    },
    steam: {
      name: 'Steam Games',
      icon: '🎮',
      description: 'Any Steam game with custom controller support',
      controls: ['Gamepad', 'Keyboard', 'Mouse', 'Custom Bindings'],
      vrSupport: true
    }
  };

  useEffect(() => {
    initializeSystem();
    return () => {
      virtualInputSystem.stop();
      vrTrackingSystem.stop();
    };
  }, []);

  const initializeSystem = async () => {
    try {
      await virtualInputSystem.start();
      await vrTrackingSystem.start();
      setIsConnected(true);
      updateStatus();
    } catch (error) {
      console.error('Failed to initialize game controller:', error);
    }
  };

  const updateStatus = () => {
    setSystemStatus(virtualInputSystem.getStatus());
    setVrStatus(vrTrackingSystem.getStatus());
  };

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
    const game = games[gameId];
    console.log(`Selected game: ${game.name}`);
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    console.log(`Starting ${games[selectedGame].name}...`);
    
    // Initialize game-specific controller
    const controller = virtualInputSystem.gameControllers[selectedGame];
    if (controller) {
      controller.initialize();
    }
  };

  const handleStopGame = () => {
    setIsPlaying(false);
    console.log(`Stopping ${games[selectedGame].name}...`);
  };

  const handleInputModeChange = (mode) => {
    setInputMode(mode);
    console.log(`Switched to ${mode} input mode`);
  };

  const handleRecordingToggle = () => {
    setRecordingMode(!recordingMode);
    console.log(`Recording mode: ${!recordingMode ? 'ON' : 'OFF'}`);
  };

  const handleVRConnect = async () => {
    try {
      await vrTrackingSystem.start();
      updateStatus();
    } catch (error) {
      console.error('Failed to connect VR:', error);
    }
  };

  const handleVRDisconnect = () => {
    vrTrackingSystem.stop();
    updateStatus();
  };

  const handleDownloadVRCFT = async () => {
    try {
      await vrTrackingSystem.vrcft.downloadMod('https://github.com/vrcft/vrcft-mod');
      console.log('VRCFT mod downloaded successfully');
    } catch (error) {
      console.error('Failed to download VRCFT mod:', error);
    }
  };

  const renderGamepad = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Left Stick</h4>
          <div className="w-32 h-32 bg-slate-700 rounded-full relative mx-auto">
            <div className="w-8 h-8 bg-blue-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Right Stick</h4>
          <div className="w-32 h-32 bg-slate-700 rounded-full relative mx-auto">
            <div className="w-8 h-8 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {['A', 'B', 'X', 'Y'].map(button => (
          <Button key={button} variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            {button}
          </Button>
        ))}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          L1
        </Button>
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          R1
        </Button>
      </div>
    </div>
  );

  const renderMouse = () => (
    <div className="space-y-4">
      <div className="w-64 h-48 bg-slate-700 rounded-lg relative mx-auto border-2 border-slate-600">
        <div className="w-4 h-4 bg-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          Left Click
        </Button>
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          Right Click
        </Button>
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          Middle Click
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-slate-400">Position: (0, 0)</p>
      </div>
    </div>
  );

  const renderKeyboard = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-10 gap-1">
        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(key => (
          <Button key={key} variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            {key}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(key => (
          <Button key={key} variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            {key}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(key => (
          <Button key={key} variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            {key}
          </Button>
        ))}
      </div>
      
      <div className="flex justify-center gap-2">
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          Space
        </Button>
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          Enter
        </Button>
        <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
          Shift
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Game Controller</h1>
              <p className="text-slate-400">Control games and VR applications with Jena AI</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <Button
                onClick={updateStatus}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Settings className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Selection */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-blue-400" />
                Game Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(games).map(([gameId, game]) => (
                <div
                  key={gameId}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedGame === gameId
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-slate-700/50 border border-slate-600/30 hover:bg-slate-700/70'
                  }`}
                  onClick={() => handleGameSelect(gameId)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.icon}</span>
                    <div>
                      <h3 className="font-medium text-white">{game.name}</h3>
                      <p className="text-sm text-slate-400">{game.description}</p>
                    </div>
                    {game.vrSupport && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 ml-auto">
                        VR
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <Button
                    onClick={handleStartGame}
                    disabled={!isConnected || isPlaying}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                  <Button
                    onClick={handleStopGame}
                    disabled={!isPlaying}
                    variant="outline"
                    className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Controls */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mouse className="w-5 h-5 text-green-400" />
                Input Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                
                <TabsContent value="keyboard" className="mt-4">
                  {renderKeyboard()}
                </TabsContent>
                
                <TabsContent value="mouse" className="mt-4">
                  {renderMouse()}
                </TabsContent>
                
                <TabsContent value="gamepad" className="mt-4">
                  {renderGamepad()}
                </TabsContent>
              </Tabs>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50">
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
              </div>
            </CardContent>
          </Card>

          {/* VR Controls */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-400" />
                VR Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">SteamVR Tracking</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${vrStatus.steamVR ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-slate-400">{vrStatus.steamVR ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">OSC Communication</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${vrStatus.osc ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-slate-400">{vrStatus.osc ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">VRChat Integration</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${vrStatus.vrchat ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-slate-400">{vrStatus.vrchat ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">VRCFT Face Tracking</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${vrStatus.vrcft ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-slate-400">{vrStatus.vrcft ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleVRConnect}
                  disabled={vrStatus.steamVR}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Connect VR
                </Button>
                
                <Button
                  onClick={handleVRDisconnect}
                  disabled={!vrStatus.steamVR}
                  variant="outline"
                  className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnect VR
                </Button>
                
                <Button
                  onClick={handleDownloadVRCFT}
                  variant="outline"
                  className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download VRCFT Mod
                </Button>
              </div>
              
              <div className="pt-4 border-t border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Game Controls</h4>
                <div className="space-y-1">
                  {games[selectedGame]?.controls.map((control, index) => (
                    <div key={index} className="text-xs text-slate-400">
                      • {control}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameController;
