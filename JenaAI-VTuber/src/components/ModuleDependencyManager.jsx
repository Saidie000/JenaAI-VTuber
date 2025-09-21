import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Network, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { moduleSystem } from '../services/moduleSystem.js';

const ModuleDependencyManager = () => {
  const [dependencyGraph, setDependencyGraph] = useState({});
  const [systemStatus, setSystemStatus] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStateDetails, setShowStateDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  const graphRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadDependencyData();
    const interval = setInterval(loadDependencyData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDependencyData = async () => {
    try {
      setIsLoading(true);
      const graph = moduleSystem.getDependencyGraph();
      const status = moduleSystem.getSystemStatus();
      const validation = moduleSystem.validateDependencyGraph();
      
      setDependencyGraph(graph);
      setSystemStatus(status);
      setValidationErrors(validation.errors);
      
      // Draw dependency graph
      drawDependencyGraph(graph);
    } catch (error) {
      console.error('Failed to load dependency data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const drawDependencyGraph = (graph) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up graph layout
    const nodes = Object.keys(graph);
    const nodeRadius = 30;
    const nodeSpacing = 120;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate node positions in a circle
    const nodePositions = {};
    nodes.forEach((nodeId, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      nodePositions[nodeId] = {
        x: centerX + Math.cos(angle) * (Math.min(width, height) / 3),
        y: centerY + Math.sin(angle) * (Math.min(width, height) / 3)
      };
    });
    
    // Draw connections
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    nodes.forEach(nodeId => {
      const node = graph[nodeId];
      const nodePos = nodePositions[nodeId];
      
      node.dependencies.forEach(depId => {
        const depPos = nodePositions[depId];
        if (depPos) {
          ctx.beginPath();
          ctx.moveTo(nodePos.x, nodePos.y);
          ctx.lineTo(depPos.x, depPos.y);
          ctx.stroke();
        }
      });
    });
    
    // Draw nodes
    nodes.forEach(nodeId => {
      const node = graph[nodeId];
      const pos = nodePositions[nodeId];
      
      // Node background
      ctx.fillStyle = node.loaded ? '#10b981' : '#6b7280';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = selectedModule === nodeId ? '#3b82f6' : '#374151';
      ctx.lineWidth = selectedModule === nodeId ? 3 : 1;
      ctx.stroke();
      
      // Node text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.substring(0, 8), pos.x, pos.y + 4);
      
      // State indicator
      if (node.hasState) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pos.x + nodeRadius - 8, pos.y - nodeRadius + 8, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const handleSaveAllStates = async () => {
    try {
      setIsLoading(true);
      const results = await moduleSystem.saveAllModuleStates();
      console.log('States saved:', results);
      loadDependencyData();
    } catch (error) {
      console.error('Failed to save states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAllStates = async () => {
    try {
      setIsLoading(true);
      const results = await moduleSystem.restoreAllModuleStates();
      console.log('States restored:', results);
      loadDependencyData();
    } catch (error) {
      console.error('Failed to restore states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllStates = async () => {
    try {
      setIsLoading(true);
      await moduleSystem.clearAllStates();
      loadDependencyData();
    } catch (error) {
      console.error('Failed to clear states:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'loaded':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'registered':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'unloaded':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const renderModuleList = () => (
    <div className="space-y-4">
      {Object.entries(dependencyGraph).map(([moduleId, module]) => (
        <Card 
          key={moduleId}
          className={`cursor-pointer transition-all duration-200 ${
            selectedModule === moduleId
              ? 'bg-blue-600/20 border-blue-500/50 shadow-lg'
              : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70'
          }`}
          onClick={() => handleModuleSelect(moduleId)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{module.name}</h3>
                <p className="text-sm text-slate-400">v{module.version}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(module.state)}
                >
                  {module.state}
                </Badge>
                
                {module.hasState && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                    State
                  </Badge>
                )}
                
                <div className="flex items-center gap-1">
                  {module.loaded ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              <div>
                <span className="text-sm text-slate-400">Dependencies: </span>
                <span className="text-sm text-slate-300">
                  {module.dependencies.length > 0 ? module.dependencies.join(', ') : 'None'}
                </span>
              </div>
              
              <div>
                <span className="text-sm text-slate-400">Dependents: </span>
                <span className="text-sm text-slate-300">
                  {module.dependents.length > 0 ? module.dependents.join(', ') : 'None'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDependencyGraph = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Dependency Graph</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadDependencyData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-slate-700 rounded-lg bg-slate-900"
          onClick={(e) => {
            // Handle canvas click for node selection
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Simple click detection (in a real implementation, you'd use proper hit testing)
            const nodes = Object.keys(dependencyGraph);
            const nodeRadius = 30;
            const nodeSpacing = 120;
            const centerX = 400;
            const centerY = 300;
            
            nodes.forEach((nodeId, index) => {
              const angle = (2 * Math.PI * index) / nodes.length;
              const nodeX = centerX + Math.cos(angle) * 200;
              const nodeY = centerY + Math.sin(angle) * 200;
              
              const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
              if (distance <= nodeRadius) {
                handleModuleSelect(nodeId);
              }
            });
          }}
        />
        
        <div className="absolute top-4 left-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Loaded</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Not Loaded</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Has State</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModuleDetails = () => {
    if (!selectedModule || !dependencyGraph[selectedModule]) {
      return (
        <div className="text-center text-slate-400 py-8">
          Select a module to view details
        </div>
      );
    }

    const module = dependencyGraph[selectedModule];
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white">{module.name}</h3>
          <p className="text-slate-400">Version {module.version}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-sm">Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              {module.dependencies.length > 0 ? (
                <div className="space-y-2">
                  {module.dependencies.map(depId => (
                    <div key={depId} className="flex items-center justify-between">
                      <span className="text-slate-300">{depId}</span>
                      <Badge 
                        variant="outline" 
                        className={dependencyGraph[depId]?.loaded ? 
                          'bg-green-500/10 text-green-400 border-green-500/30' : 
                          'bg-red-500/10 text-red-400 border-red-500/30'
                        }
                      >
                        {dependencyGraph[depId]?.loaded ? 'Loaded' : 'Not Loaded'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No dependencies</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-sm">Dependents</CardTitle>
            </CardHeader>
            <CardContent>
              {module.dependents.length > 0 ? (
                <div className="space-y-2">
                  {module.dependents.map(depId => (
                    <div key={depId} className="flex items-center justify-between">
                      <span className="text-slate-300">{depId}</span>
                      <Badge 
                        variant="outline" 
                        className={dependencyGraph[depId]?.loaded ? 
                          'bg-green-500/10 text-green-400 border-green-500/30' : 
                          'bg-red-500/10 text-red-400 border-red-500/30'
                        }
                      >
                        {dependencyGraph[depId]?.loaded ? 'Loaded' : 'Not Loaded'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No dependents</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {module.hasState && showStateDetails && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-sm">Module State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-auto">
                {JSON.stringify(module.state, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderValidationErrors = () => (
    <Card className="bg-red-900/20 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Dependency Validation Errors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validationErrors.length > 0 ? (
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-sm text-red-300">
                • {error}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            All dependencies are valid
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Module Dependency Manager</h1>
          <p className="text-slate-400">Manage module dependencies and state persistence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module List */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-400" />
                Modules ({Object.keys(dependencyGraph).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {renderModuleList()}
              </div>
            </CardContent>
          </Card>

          {/* Dependency Graph */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-green-400" />
                Dependency Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderDependencyGraph()}
            </CardContent>
          </Card>

          {/* Module Details */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Module Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {renderModuleDetails()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* State Management */}
        <Card className="mt-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-yellow-400" />
              State Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSaveAllStates}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save All States
              </Button>
              
              <Button
                onClick={handleRestoreAllStates}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Restore All States
              </Button>
              
              <Button
                onClick={handleClearAllStates}
                disabled={isLoading}
                variant="outline"
                className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All States
              </Button>
              
              <Button
                onClick={() => setShowStateDetails(!showStateDetails)}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {showStateDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showStateDetails ? 'Hide' : 'Show'} State Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-6">
            {renderValidationErrors()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDependencyManager;
