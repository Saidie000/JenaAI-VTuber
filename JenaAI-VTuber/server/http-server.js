const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API endpoints for dashboard data
app.get('/api/training-data', (req, res) => {
    // Simulate training data from IndexedDB
    const trainingData = {
        sessions: [
            {
                id: 1,
                type: 'Facial Expression',
                duration: '2h 15m',
                accuracy: 92,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            },
            {
                id: 2,
                type: 'Voice Modulation',
                duration: '1h 30m',
                accuracy: 87,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            }
        ],
        progress: {
            facialExpressions: 85,
            voiceModulation: 72,
            bodyLanguage: 68
        }
    };
    
    res.json(trainingData);
});

app.get('/api/animations', (req, res) => {
    // Simulate learned animations data
    const animations = {
        learned: [
            {
                id: 1,
                name: 'Happy Wave',
                category: 'gesture',
                source: 'Video Analysis',
                confidence: 95,
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                name: 'Surprised Expression',
                category: 'facial',
                source: 'User Interaction',
                confidence: 88,
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            }
        ],
        categories: {
            facial: 12,
            body: 8,
            gesture: 15,
            emotion: 6
        }
    };
    
    res.json(animations);
});

app.get('/api/voice-samples', (req, res) => {
    // Simulate voice samples data
    const voiceSamples = [
        {
            id: 1,
            text: 'Hello, how are you today?',
            emotion: 'happy',
            duration: '3.2s',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            text: 'I am learning new things every day!',
            emotion: 'excited',
            duration: '4.1s',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    res.json(voiceSamples);
});

app.get('/api/notes', (req, res) => {
    // Simulate notes and insights data
    const notes = [
        {
            id: 1,
            title: 'Facial Expression Learning',
            content: 'Noticed that eyebrow movements are crucial for expressing surprise. Need to focus more on micro-expressions.',
            category: 'learning',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            title: 'Voice Pattern Recognition',
            content: 'Higher pitch variations work better for expressing excitement. Lower tones for serious topics.',
            category: 'voice',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    res.json(notes);
});

app.get('/api/system-status', (req, res) => {
    // Simulate system status
    const status = {
        aiProcessing: 'active',
        memoryUsage: '2.4GB / 8GB',
        gpuAcceleration: 'enabled',
        websocket: 'connected',
        lastUpdate: new Date().toISOString()
    };
    
    res.json(status);
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
});

console.log('WebSocket server created on path /ws');

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    console.log('Client connected from:', req.socket.remoteAddress);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Jena AI WebSocket server',
        timestamp: new Date().toISOString()
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data.type);
            
            switch (data.type) {
                case 'register':
                    console.log(`Client registered as: ${data.clientType}`);
                    ws.send(JSON.stringify({
                        type: 'registered',
                        clientType: data.clientType,
                        message: 'Successfully registered with server'
                    }));
                    break;
                    
                case 'ai_command':
                    console.log('AI Command received:', data.data.command);
                    // Simulate AI processing
                    setTimeout(() => {
                        ws.send(JSON.stringify({
                            type: 'ai_response',
                            data: {
                                response: `I understand you want me to: "${data.data.command}". I'm processing this request and will generate the appropriate code.`,
                                command: data.data.command,
                                timestamp: new Date().toISOString()
                            }
                        }));
                        
                        // Simulate code generation
                        setTimeout(() => {
                            const generatedCode = generateCodeFromCommand(data.data.command);
                            ws.send(JSON.stringify({
                                type: 'code_generated',
                                data: {
                                    code: generatedCode,
                                    command: data.data.command,
                                    timestamp: new Date().toISOString()
                                }
                            }));
                        }, 2000);
                    }, 1000);
                    break;
                    
                case 'push_update':
                    console.log('Update push requested');
                    // Simulate update processing
                    setTimeout(() => {
                        ws.send(JSON.stringify({
                            type: 'update_pushed',
                            data: {
                                message: 'Code update successfully applied to the system',
                                timestamp: new Date().toISOString()
                            }
                        }));
                    }, 1500);
                    break;
                    
                case 'get_dashboard_data':
                    console.log('Dashboard data requested');
                    // Send dashboard data
                    ws.send(JSON.stringify({
                        type: 'dashboard_data',
                        data: {
                            trainingSessions: 3,
                            learnedAnimations: 4,
                            voiceSamples: 3,
                            notes: 2,
                            timestamp: new Date().toISOString()
                        }
                    }));
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
                    ws.send(JSON.stringify({
                        type: 'error',
                        data: {
                            error: 'Unknown message type',
                            timestamp: new Date().toISOString()
                        }
                    }));
            }
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                data: {
                    error: 'Invalid message format',
                    timestamp: new Date().toISOString()
                }
            }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Function to generate code based on command
function generateCodeFromCommand(command) {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('facial') || lowerCommand.includes('expression')) {
        return `// Generated code for facial expression control
export const updateFacialExpression = (emotion) => {
    const expressions = {
        happy: { smile: 1.0, eyeSquint: 0.8 },
        sad: { frown: 1.0, eyeSquint: 0.2 },
        surprised: { eyeWide: 1.0, mouthOpen: 0.6 }
    };
    
    const targetExpression = expressions[emotion] || expressions.happy;
    
    // Apply expression to avatar
    Object.keys(targetExpression).forEach(key => {
        avatar.setMorphTarget(key, targetExpression[key]);
    });
    
    console.log(\`Applied \${emotion} expression\`);
};`;
    } else if (lowerCommand.includes('voice') || lowerCommand.includes('speak')) {
        return `// Generated code for voice control
export const updateVoiceSettings = (settings) => {
    const voiceConfig = {
        pitch: settings.pitch || 1.0,
        rate: settings.rate || 1.0,
        volume: settings.volume || 1.0,
        emotion: settings.emotion || 'neutral'
    };
    
    // Apply voice settings
    ttsService.updateSettings(voiceConfig);
    
    console.log('Voice settings updated:', voiceConfig);
};`;
    } else if (lowerCommand.includes('animation') || lowerCommand.includes('move')) {
        return `// Generated code for animation control
export const playAnimation = (animationName) => {
    const animations = {
        wave: { duration: 2000, loop: false },
        dance: { duration: 5000, loop: true },
        idle: { duration: 10000, loop: true }
    };
    
    const animation = animations[animationName];
    if (animation) {
        avatar.playAnimation(animationName, animation);
        console.log(\`Playing animation: \${animationName}\`);
    }
};`;
    } else {
        return `// Generated code based on command: "${command}"
export const executeCommand = () => {
    console.log('Executing command:', '${command}');
    
    // Add your custom logic here
    // This is a template for the requested functionality
    
    return {
        success: true,
        message: 'Command executed successfully',
        timestamp: new Date().toISOString()
    };
};`;
    }
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Jena AI Server running on:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}`);
    console.log(`   WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`\n📱 Access from any device on your network using your computer's IP address`);
    console.log(`   Example: http://192.168.1.100:${PORT}`);
    console.log(`\n🎯 Available interfaces:`);
    console.log(`   Main:     http://localhost:${PORT}/`);
    console.log(`   Chat:     http://localhost:${PORT}/chat.html`);
    console.log(`   Dashboard: http://localhost:${PORT}/dashboard.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
