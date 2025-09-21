import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Send, 
  Upload, 
  Code, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  Terminal,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [systemStatus, setSystemStatus] = useState('disconnected');
  const [ws, setWs] = useState(null);
  const [serverIP, setServerIP] = useState('localhost:8080');
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const codeEditorRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${serverIP}`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setSystemStatus('connected');
      addMessage('system', 'Connected to server', 'success');
      
      // Register as chat client
      websocket.send(JSON.stringify({
        type: 'register',
        clientType: 'chat-interface'
      }));
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setSystemStatus('disconnected');
      addMessage('system', 'Disconnected from server', 'error');
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!isConnected) {
          connectWebSocket();
        }
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      addMessage('system', 'Connection error', 'error');
    };

    setWs(websocket);
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'registered':
        addMessage('system', 'Registered with server', 'success');
        break;
      case 'ai_response':
        addMessage('ai', message.data.response, 'info');
        break;
      case 'code_generated':
        setGeneratedCode(message.data.code);
        addMessage('system', 'Code generated successfully', 'success');
        break;
      case 'update_pushed':
        addMessage('system', `Update pushed: ${message.data.message}`, 'success');
        break;
      case 'error':
        addMessage('system', `Error: ${message.data.error}`, 'error');
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const addMessage = (sender, content, type = 'info') => {
    const message = {
      id: Date.now(),
      sender,
      content,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !ws || !isConnected) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    // Add user message to chat
    addMessage('user', userMessage, 'user');

    try {
      // Send message to server for AI processing
      ws.send(JSON.stringify({
        type: 'ai_command',
        data: {
          command: userMessage,
          context: {
            uploadedFiles: uploadedFiles.map(f => ({ name: f.name, type: f.type })),
            systemState: systemStatus,
            timestamp: Date.now()
          },
          priority: 'normal'
        }
      }));

      // Simulate AI processing
      setTimeout(() => {
        setIsProcessing(false);
        addMessage('ai', 'Processing your request...', 'info');
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('system', 'Failed to send message', 'error');
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    addMessage('system', `Uploaded ${files.length} file(s)`, 'success');
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const pushUpdate = async () => {
    if (!generatedCode.trim() || !ws || !isConnected) {
      addMessage('system', 'No code to push or not connected', 'error');
      return;
    }

    try {
      addMessage('system', 'Pushing update to system...', 'info');
      
      ws.send(JSON.stringify({
        type: 'push_update',
        data: {
          code: generatedCode,
          files: uploadedFiles.map(f => ({
            name: f.name,
            content: f.file // In real implementation, you'd read the file content
          })),
          timestamp: Date.now()
        }
      }));

    } catch (error) {
      console.error('Error pushing update:', error);
      addMessage('system', 'Failed to push update', 'error');
    }
  };

  const clearChat = () => {
    setMessages([]);
    setGeneratedCode('');
    setUploadedFiles([]);
  };

  const getMessageIcon = (sender) => {
    switch (sender) {
      case 'user': return '👤';
      case 'ai': return '🤖';
      case 'system': return '⚙️';
      default: return '💬';
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'user': return 'text-white';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">AI System Controller</h1>
              <p className="text-slate-400">Chat with AI to control and update your avatar system</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-slate-300">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <input
                type="text"
                value={serverIP}
                onChange={(e) => setServerIP(e.target.value)}
                placeholder="Server IP:Port"
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm"
              />
              
              <Button
                onClick={connectWebSocket}
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Terminal className="w-4 h-4 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Panel */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                AI Chat
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 ml-auto">
                  {messages.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="text-2xl">{getMessageIcon(message.sender)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-300">
                          {message.sender === 'user' ? 'You' : 
                           message.sender === 'ai' ? 'AI Assistant' : 'System'}
                        </span>
                        <span className="text-xs text-slate-500">{message.timestamp}</span>
                      </div>
                      <p className={`text-sm ${getMessageColor(message.type)}`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="text-2xl">🤖</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-300">AI Assistant</span>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      </div>
                      <p className="text-sm text-blue-400">Processing your request...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex gap-2 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload Files
                  </Button>
                  
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your command or instruction here..."
                    className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isConnected || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Generation Panel */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Code className="w-5 h-5 text-green-400" />
                Generated Code
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 ml-auto">
                  {generatedCode ? 'Ready' : 'Empty'}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Code Editor */}
              <div className="h-64 bg-slate-900 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {generatedCode || '// Generated code will appear here...\n// Send a command to the AI to generate code'}
                </pre>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-white">{file.name}</span>
                          <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button
                          onClick={() => removeFile(file.id)}
                          variant="outline"
                          size="sm"
                          className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={pushUpdate}
                  disabled={!generatedCode.trim() || !isConnected}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Push Update
                </Button>
                
                <Button
                  onClick={() => setGeneratedCode('')}
                  variant="outline"
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  {isConnected ? 
                    'Ready to receive commands and push updates' : 
                    'Connect to server to start'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
