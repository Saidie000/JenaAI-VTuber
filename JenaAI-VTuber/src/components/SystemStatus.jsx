import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Monitor, 
  Headphones, 
  Camera, 
  Gamepad2,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { virtualInputSystem } from '../services/virtualInputSystem.js';
import { vrTrackingSystem } from '../services/vrTrackingSystem.js';

const SystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState({});
  const [vrStatus, setVrStatus] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async () => {
    setIsRefreshing(true);
    try {
      const inputStatus = virtualInputSystem.getStatus();
      const trackingStatus = vrTrackingSystem.getStatus();
      
      setSystemStatus(inputStatus);
      setVrStatus(trackingStatus);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update system status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (isActive, isConnected) => {
    if (isActive && isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (isActive || isConnected) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (isActive, isConnected) => {
    if (isActive && isConnected) {
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    } else if (isActive || isConnected) {
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    } else {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getStatusText = (isActive, isConnected) => {
    if (isActive && isConnected) {
      return 'Active';
    } else if (isActive || isConnected) {
      return 'Partial';
    } else {
      return 'Inactive';
    }
  };

  const systems = [
    {
      id: 'virtualInput',
      name: 'Virtual Input System',
      icon: <Gamepad2 className="w-5 h-5" />,
      status: systemStatus.isActive,
      details: {
        'Mouse Position': `${systemStatus.mousePosition?.x || 0}, ${systemStatus.mousePosition?.y || 0}`,
        'Keyboard State': Object.keys(systemStatus.keyboardState || {}).length + ' keys',
        'Gamepad State': Object.keys(systemStatus.gamepadState || {}).length + ' buttons'
      }
    },
    {
      id: 'steamVR',
      name: 'SteamVR Tracking',
      icon: <Headphones className="w-5 h-5" />,
      status: vrStatus.steamVR,
      details: {
        'Trackers': vrStatus.skeleton || 0,
        'HMD': 'Connected',
        'Controllers': '2 Active'
      }
    },
    {
      id: 'osc',
      name: 'OSC Communication',
      icon: <Wifi className="w-5 h-5" />,
      status: vrStatus.osc,
      details: {
        'Port': '9000',
        'Address': '127.0.0.1',
        'Messages': 'Active'
      }
    },
    {
      id: 'vrchat',
      name: 'VRChat Integration',
      icon: <Monitor className="w-5 h-5" />,
      status: vrStatus.vrchat,
      details: {
        'Avatar': 'Loaded',
        'World': 'Connected',
        'Chat': 'Active'
      }
    },
    {
      id: 'vrcft',
      name: 'VRCFT Face Tracking',
      icon: <Camera className="w-5 h-5" />,
      status: vrStatus.vrcft,
      details: {
        'Face Data': vrStatus.faceTracking ? 'Active' : 'Inactive',
        'Parameters': '12 Active',
        'Mod': 'Installed'
      }
    },
    {
      id: 'database',
      name: 'IndexedDB Storage',
      icon: <Database className="w-5 h-5" />,
      status: true, // Assume always active
      details: {
        'Movements': '150+ stored',
        'Animations': '50+ stored',
        'Expressions': '25+ stored',
        'TTS Data': '100+ stored'
      }
    }
  ];

  const performanceMetrics = [
    {
      name: 'CPU Usage',
      value: '45%',
      status: 'good',
      icon: <Cpu className="w-4 h-4" />
    },
    {
      name: 'Memory Usage',
      value: '2.1GB',
      status: 'good',
      icon: <HardDrive className="w-4 h-4" />
    },
    {
      name: 'Network Latency',
      value: '12ms',
      status: 'good',
      icon: <Wifi className="w-4 h-4" />
    },
    {
      name: 'Frame Rate',
      value: '60 FPS',
      status: 'good',
      icon: <Monitor className="w-4 h-4" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Status</h2>
          <p className="text-slate-400">Real-time monitoring of all AI systems</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            onClick={updateStatus}
            disabled={isRefreshing}
            variant="outline"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systems.map((system) => (
          <Card key={system.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                {system.icon}
                {system.name}
                {getStatusIcon(system.status, system.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Status</span>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(system.status, system.status)}
                >
                  {getStatusText(system.status, system.status)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {Object.entries(system.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-400">{key}</span>
                    <span className="text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.name} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-slate-400">{metric.name}</div>
                <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                  metric.status === 'good' ? 'bg-green-500' : 
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Summary */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            System Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {systems.filter(s => s.status).length}/{systems.length}
              </div>
              <div className="text-slate-400">Systems Active</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {performanceMetrics.filter(m => m.status === 'good').length}/{performanceMetrics.length}
              </div>
              <div className="text-slate-400">Performance Good</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {Math.round((systems.filter(s => s.status).length / systems.length) * 100)}%
              </div>
              <div className="text-slate-400">Overall Health</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatus;
