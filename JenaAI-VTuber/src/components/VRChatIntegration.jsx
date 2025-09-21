import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { 
  Headphones, 
  Camera, 
  MessageCircle, 
  Play, 
  Pause, 
  Square,
  Settings,
  Download,
  Wifi,
  WifiOff,
  Smile,
  Frown,
  Eye,
  Mic,
  MicOff
} from 'lucide-react';
import { vrTrackingSystem } from '../services/vrTrackingSystem.js';

const VRChatIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [oscConnected, setOscConnected] = useState(false);
  const [vrcftConnected, setVrcftConnected] = useState(false);
  const [avatarId, setAvatarId] = useState('');
  const [worldId, setWorldId] = useState('');
  const [isInVR, setIsInVR] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Avatar parameters
  const [avatarParameters, setAvatarParameters] = useState({
    // Face tracking
    Viseme: 0,
    EyeLookLeft: 0,
    EyeLookRight: 0,
    EyeLookUp: 0,
    EyeLookDown: 0,
    EyeBlinkLeft: 0,
    EyeBlinkRight: 0,
    JawOpen: 0,
    TongueOut: 0,
    MouthSmileLeft: 0,
    MouthSmileRight: 0,
    MouthFrownLeft: 0,
    MouthFrownRight: 0,
    
    // Gestures
    GestureLeft: 0,
    GestureRight: 0,
    
    // Expressions
    Expression: 0,
    
    // Animations
    Animation: 0,
    
    // Voice
    Voice: 0,
    Mute: 0
  });
  
  // Tracking data
  const [trackingData, setTrackingData] = useState({
    head: { position: { x: 0, y: 1.6, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    leftHand: { position: { x: -0.3, y: 1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    rightHand: { position: { x: 0.3, y: 1.2, z: 0.3 }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    leftFoot: { position: { x: -0.1, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    rightFoot: { position: { x: 0.1, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    hip: { position: { x: 0, y: 0.9, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    chest: { position: { x: 0, y: 1.3, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }
  });
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [gesturePresets, setGesturePresets] = useState({
    wave: { left: 1, right: 1 },
    point: { left: 2, right: 2 },
    thumbsUp: { left: 3, right: 3 },
    peace: { left: 4, right: 4 },
    rock: { left: 5, right: 5 }
  });
  
  const [expressionPresets, setExpressionPresets] = useState({
    happy: 1,
    sad: 2,
    angry: 3,
    surprised: 4,
    scared: 5,
    neutral: 0
  });
  
  const [animationPresets, setAnimationPresets] = useState({
    idle: 0,
    walk: 1,
    run: 2,
    jump: 3,
    dance: 4,
    wave: 5,
    clap: 6
  });
  
  const statusRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  useEffect(() => {
    initializeVRChat();
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      vrTrackingSystem.stop();
    };
  }, []);

  const initializeVRChat = async () => {
    try {
      await vrTrackingSystem.start();
      setIsConnected(true);
      setOscConnected(vrTrackingSystem.oscConnected);
      setVrcftConnected(vrTrackingSystem.vrcftConnected);
      
      // Start tracking data updates
      startTrackingUpdates();
      
      // Listen for VR events
      vrTrackingSystem.on('vrchat:connected', () => {
        console.log('VRChat connected');
        setIsConnected(true);
      });
      
      vrTrackingSystem.on('osc:connected', () => {
        console.log('OSC connected');
        setOscConnected(true);
      });
      
      vrTrackingSystem.on('vrcft:connected', () => {
        console.log('VRCFT connected');
        setVrcftConnected(true);
      });
      
    } catch (error) {
      console.error('Failed to initialize VRChat:', error);
    }
  };

  const startTrackingUpdates = () => {
    trackingIntervalRef.current = setInterval(() => {
      // Update tracking data from VR system
      const currentTrackingData = vrTrackingSystem.getTrackingData();
      if (currentTrackingData.skeleton) {
        setTrackingData(currentTrackingData.skeleton);
      }
      
      // Update face tracking data
      if (currentTrackingData.faceTracking) {
        setAvatarParameters(prev => ({
          ...prev,
          ...currentTrackingData.faceTracking
        }));
      }
    }, 100); // Update every 100ms
  };

  const handleConnect = async () => {
    try {
      await vrTrackingSystem.start();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to VRChat:', error);
    }
  };

  const handleDisconnect = () => {
    vrTrackingSystem.stop();
    setIsConnected(false);
    setOscConnected(false);
    setVrcftConnected(false);
  };

  const handleAvatarParameterChange = (parameter, value) => {
    const newParameters = { ...avatarParameters, [parameter]: value };
    setAvatarParameters(newParameters);
    
    // Send to VRChat via OSC
    if (oscConnected) {
      vrTrackingSystem.osc.sendAvatarParameters({ [parameter]: value });
    }
  };

  const handleTrackingDataChange = (tracker, axis, value) => {
    const newTrackingData = { ...trackingData };
    if (axis === 'position') {
      newTrackingData[tracker].position = { ...newTrackingData[tracker].position, ...value };
    } else if (axis === 'rotation') {
      newTrackingData[tracker].rotation = { ...newTrackingData[tracker].rotation, ...value };
    }
    
    setTrackingData(newTrackingData);
    
    // Send to VRChat via OSC
    if (oscConnected) {
      vrTrackingSystem.osc.sendTrackingData(newTrackingData);
    }
  };

  const handleGesture = (gestureName) => {
    const gesture = gesturePresets[gestureName];
    if (gesture) {
      handleAvatarParameterChange('GestureLeft', gesture.left);
      handleAvatarParameterChange('GestureRight', gesture.right);
    }
  };

  const handleExpression = (expressionName) => {
    const expression = expressionPresets[expressionName];
    if (expression !== undefined) {
      handleAvatarParameterChange('Expression', expression);
    }
  };

  const handleAnimation = (animationName) => {
    const animation = animationPresets[animationName];
    if (animation !== undefined) {
      handleAvatarParameterChange('Animation', animation);
    }
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      const message = {
        id: Date.now(),
        text: chatMessage,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'Jena AI'
      };
      
      setChatHistory(prev => [...prev, message]);
      setChatMessage('');
      
      // Send to VRChat
      if (isConnected) {
        vrTrackingSystem.vrchat.sendChatMessage(chatMessage);
      }
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    handleAvatarParameterChange('Mute', isMuted ? 0 : 1);
  };

  const handleVoiceToggle = () => {
    setIsSpeaking(!isSpeaking);
    handleAvatarParameterChange('Voice', isSpeaking ? 0 : 1);
  };

  const handleDownloadVRCFT = async () => {
    try {
      await vrTrackingSystem.vrcft.downloadMod('https://github.com/vrcft/vrcft-mod');
      console.log('VRCFT mod downloaded successfully');
    } catch (error) {
      console.error('Failed to download VRCFT mod:', error);
    }
  };

  const renderFaceTracking = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Viseme</label>
          <Slider
            value={[avatarParameters.Viseme]}
            onValueChange={([value]) => handleAvatarParameterChange('Viseme', value)}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Jaw Open</label>
          <Slider
            value={[avatarParameters.JawOpen]}
            onValueChange={([value]) => handleAvatarParameterChange('JawOpen', value)}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Eye Look Left</label>
          <Slider
            value={[avatarParameters.EyeLookLeft]}
            onValueChange={([value]) => handleAvatarParameterChange('EyeLookLeft', value)}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Eye Look Right</label>
          <Slider
            value={[avatarParameters.EyeLookRight]}
            onValueChange={([value]) => handleAvatarParameterChange('EyeLookRight', value)}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Eye Look Up</label>
          <Slider
            value={[avatarParameters.EyeLookUp]}
            onValueChange={([value]) => handleAvatarParameterChange('EyeLookUp', value)}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Eye Look Down</label>
          <Slider
            value={[avatarParameters.EyeLookDown]}
            onValueChange={([value]) => handleAvatarParameterChange('EyeLookDown', value)}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderTrackingControls = () => (
    <div className="space-y-4">
      {Object.entries(trackingData).map(([trackerName, data]) => (
        <div key={trackerName} className="bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3 capitalize">{trackerName.replace(/([A-Z])/g, ' $1')}</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Position</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">X</span>
                  <Slider
                    value={[data.position.x]}
                    onValueChange={([value]) => handleTrackingDataChange(trackerName, 'position', { x: value })}
                    min={-2}
                    max={2}
                    step={0.01}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">Y</span>
                  <Slider
                    value={[data.position.y]}
                    onValueChange={([value]) => handleTrackingDataChange(trackerName, 'position', { y: value })}
                    min={-2}
                    max={2}
                    step={0.01}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">Z</span>
                  <Slider
                    value={[data.position.z]}
                    onValueChange={([value]) => handleTrackingDataChange(trackerName, 'position', { z: value })}
                    min={-2}
                    max={2}
                    step={0.01}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Rotation</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">X</span>
                  <Slider
                    value={[data.rotation.x]}
                    onValueChange={([value]) => handleTrackingDataChange(trackerName, 'rotation', { x: value })}
                    min={-1}
                    max={1}
                    step={0.01}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">Y</span>
                  <Slider
                    value={[data.rotation.y]}
                    onValueChange={([value]) => handleTrackingDataChange(trackerName, 'rotation', { y: value })}
                    min={-1}
                    max={1}
                    step={0.01}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">Z</span>
                  <Slider
                    value={[data.rotation.z]}
                    onValueChange={([value]) => handleTrackingDataChange(trackerName, 'rotation', { z: value })}
                    min={-1}
                    max={1}
                    step={0.01}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">VRChat Integration</h1>
              <p className="text-slate-400">Control your VRChat avatar with Jena AI</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <Button
                onClick={handleConnect}
                disabled={isConnected}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Connect
              </Button>
              
              <Button
                onClick={handleDisconnect}
                disabled={!isConnected}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <WifiOff className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Face Tracking */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Smile className="w-5 h-5 text-pink-400" />
                Face Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderFaceTracking()}
            </CardContent>
          </Card>

          {/* Tracking Controls */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-400" />
                Body Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {renderTrackingControls()}
              </div>
            </CardContent>
          </Card>

          {/* Gestures & Expressions */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-green-400" />
                Gestures & Expressions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Gestures</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(gesturePresets).map(([name, gesture]) => (
                    <Button
                      key={name}
                      onClick={() => handleGesture(name)}
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 capitalize"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Expressions</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(expressionPresets).map(([name, value]) => (
                    <Button
                      key={name}
                      onClick={() => handleExpression(name)}
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 capitalize"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Animations</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(animationPresets).map(([name, value]) => (
                    <Button
                      key={name}
                      onClick={() => handleAnimation(name)}
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 capitalize"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat & Voice */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                Chat & Voice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Chat Message</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendChat();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendChat}
                    disabled={!chatMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Voice Controls</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={handleMuteToggle}
                    variant="outline"
                    className={`${isMuted ? 'bg-red-600/20 border-red-600/30 text-red-400' : 'bg-slate-700 border-slate-600 text-white'} hover:bg-slate-600`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  
                  <Button
                    onClick={handleVoiceToggle}
                    variant="outline"
                    className={`${isSpeaking ? 'bg-green-600/20 border-green-600/30 text-green-400' : 'bg-slate-700 border-slate-600 text-white'} hover:bg-slate-600`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isSpeaking ? 'Stop Speaking' : 'Start Speaking'}
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Chat History</h4>
                <div className="max-h-32 overflow-y-auto scrollbar-hide space-y-1">
                  {chatHistory.map((message) => (
                    <div key={message.id} className="text-xs text-slate-400">
                      <span className="text-slate-500">[{message.timestamp}]</span> {message.sender}: {message.text}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Settings */}
        <Card className="mt-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Status & Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${oscConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm text-slate-300">OSC</p>
                <p className="text-xs text-slate-400">{oscConnected ? 'Connected' : 'Disconnected'}</p>
              </div>
              
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${vrcftConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm text-slate-300">VRCFT</p>
                <p className="text-xs text-slate-400">{vrcftConnected ? 'Connected' : 'Disconnected'}</p>
              </div>
              
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isInVR ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <p className="text-sm text-slate-300">VR Mode</p>
                <p className="text-xs text-slate-400">{isInVR ? 'In VR' : 'Desktop'}</p>
              </div>
              
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <p className="text-sm text-slate-300">Voice</p>
                <p className="text-xs text-slate-400">{isMuted ? 'Muted' : 'Active'}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <Button
                onClick={handleDownloadVRCFT}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download VRCFT Mod
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VRChatIntegration;
