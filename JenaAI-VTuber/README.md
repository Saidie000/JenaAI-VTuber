# Jena AI VTuber System

A comprehensive AI-powered 3D avatar system with virtual input capabilities, VR integration, and game control features. This system allows Jena AI to control games, interact in VRChat, and manage her own virtual presence through advanced input simulation and tracking systems.

## 🚀 Features

### Core Avatar System
- **3D Avatar Rendering**: Real-time 3D avatar display using Three.js
- **IndexedDB Storage**: Persistent storage for movements, animations, expressions, and training data
- **AI Integration**: WebLLM integration for natural language processing and decision making
- **Modular Architecture**: Dynamic module loading and hot-swapping via WebSocket
- **Real-time Updates**: Live system updates without restarts

### Virtual Input System
- **Virtual Mouse & Keyboard**: Complete input simulation for desktop applications
- **Gamepad Support**: Virtual gamepad controls for console-style games
- **Game-Specific Controllers**: Customized controls for Minecraft, Osu!, VRChat, and Steam games
- **Input Recording**: Record and replay input sequences
- **Multi-Modal Input**: Switch between keyboard, mouse, and gamepad modes

### VR Integration
- **SteamVR Virtual Tracking**: Full-body tracking with virtual trackers
- **OSC Communication**: Open Sound Control for VRChat integration
- **VRCFT Face Tracking**: Advanced facial expression tracking
- **VRChat Avatar Control**: Direct control of VRChat avatars
- **Virtual Skeleton**: Complete body tracking system

### Game Control
- **Minecraft**: Full movement, building, and interaction controls
- **Osu!**: Rhythm game precision input
- **VRChat**: Social VR platform integration
- **Steam Games**: Universal game launcher and control system
- **Custom Bindings**: Per-game control customization

### Web Interface
- **IP-Based Access**: Access via any device on the network
- **Chat Interface**: AI command interface with file upload
- **Dashboard**: Comprehensive system monitoring and data visualization
- **Real-time Status**: Live system health monitoring

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with WebGL support
- SteamVR (for VR features)
- VRChat (for VR integration)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd JenaAI-VTuber

# Install dependencies
npm install

# Start the development server
npm run dev

# Start the HTTP server (for IP access)
npm run server

# Start the WebSocket server (for real-time updates)
npm run websocket
```

### Access Points
- **Main Application**: `http://localhost:5173`
- **IP Access**: `http://[your-ip]:3000`
- **Chat Interface**: `http://[your-ip]:3000/chat.html`
- **Dashboard**: `http://[your-ip]:3000/dashboard.html`

## 🎮 Usage

### Avatar Control
1. **Load 3D Model**: Upload GLTF/GLB files or select built-in models
2. **Control Expressions**: Use sliders for facial expressions and morph targets
3. **Eye Gaze**: Control eye movement and focus
4. **Skeletal Animation**: Manipulate bone rotations and positions
5. **Voice Control**: TTS integration with multiple voice options

### Game Control
1. **Select Game**: Choose from Minecraft, Osu!, VRChat, or Steam games
2. **Configure Input**: Set up keyboard, mouse, or gamepad controls
3. **Launch Game**: Start the game with virtual input enabled
4. **Monitor Status**: Track game performance and input activity
5. **Record Actions**: Capture and replay input sequences

### VR Integration
1. **Connect SteamVR**: Enable virtual tracking system
2. **Setup OSC**: Configure VRChat communication
3. **Load VRCFT**: Install face tracking mod
4. **Control Avatar**: Use VR controllers or desktop input
5. **Social Interaction**: Chat and interact in VRChat

### AI Commands
1. **Chat Interface**: Type commands to control the system
2. **File Upload**: Upload new modules or configurations
3. **Code Updates**: Push real-time code changes
4. **System Control**: Start/stop services and modules

## 🏗️ Architecture

### Core Services
- **Virtual Input System**: Handles all input simulation
- **VR Tracking System**: Manages VR and tracking data
- **Module System**: Dynamic module loading and management
- **AI Module Manager**: AI-driven system control
- **IndexedDB Storage**: Persistent data management

### Components
- **AvatarViewer**: Main 3D avatar display
- **GameController**: Game control interface
- **GameLauncher**: Game selection and launch
- **VRChatIntegration**: VR platform integration
- **ChatInterface**: AI command interface
- **SystemStatus**: Health monitoring dashboard

### Data Flow
```
AI Commands → Module System → Virtual Input → Games/VR
     ↓
IndexedDB ← Avatar Store ← 3D Scene ← Tracking Data
```

## 🔧 Configuration

### Virtual Input Settings
```javascript
// Configure input sensitivity
const inputConfig = {
  mouseSensitivity: 1.0,
  keyboardRepeatRate: 50,
  gamepadDeadzone: 0.1,
  recordingFPS: 60
};
```

### VR Tracking Settings
```javascript
// Configure tracking parameters
const trackingConfig = {
  oscPort: 9000,
  oscAddress: '127.0.0.1',
  trackerCount: 7,
  updateRate: 100
};
```

### Game Bindings
```javascript
// Customize game controls
const gameBindings = {
  minecraft: {
    'w': 'forward',
    's': 'backward',
    'space': 'jump'
  },
  osu: {
    'z': 'left_click',
    'x': 'right_click'
  }
};
```

## 📊 Monitoring

### System Status
- **Virtual Input**: Mouse, keyboard, and gamepad status
- **VR Tracking**: SteamVR, OSC, and VRChat connections
- **Performance**: CPU, memory, and network metrics
- **Game Status**: Running games and input activity

### Data Analytics
- **Movement Patterns**: Track avatar movement data
- **Expression Usage**: Monitor facial expression frequency
- **Game Performance**: Analyze input accuracy and timing
- **Learning Progress**: Track AI improvement over time

## 🚀 Advanced Features

### Dynamic Module System
- **Hot Swapping**: Update modules without restart
- **Dependency Management**: Automatic module dependency resolution
- **State Persistence**: Maintain module state across updates
- **Error Recovery**: Automatic fallback on module failures

### AI Integration
- **Natural Language Commands**: Control system with text
- **Learning System**: AI learns from user interactions
- **Adaptive Controls**: Automatically adjust to user preferences
- **Predictive Input**: Anticipate user actions

### VR Features
- **Full Body Tracking**: Complete skeleton tracking
- **Face Tracking**: Advanced facial expression capture
- **Gesture Recognition**: Hand gesture interpretation
- **Voice Integration**: Speech-to-text and voice commands

## 🔒 Security

### Network Security
- **Local Network Only**: Default to local network access
- **Authentication**: Optional user authentication
- **Input Validation**: Sanitize all user inputs
- **Module Sandboxing**: Isolate module execution

### Data Protection
- **Local Storage**: All data stored locally
- **Encryption**: Sensitive data encryption
- **Backup System**: Automatic data backups
- **Privacy Mode**: Disable data collection

## 🐛 Troubleshooting

### Common Issues
1. **WebGL Not Supported**: Update browser or enable WebGL
2. **SteamVR Not Detected**: Install SteamVR and restart
3. **OSC Connection Failed**: Check port 9000 availability
4. **Module Load Error**: Check module dependencies

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev

# Check system status
npm run status

# Reset configuration
npm run reset
```

## 📈 Performance

### Optimization
- **Input Batching**: Batch input events for efficiency
- **LOD System**: Level-of-detail for 3D models
- **Memory Management**: Automatic cleanup of unused data
- **Frame Rate Control**: Adaptive quality based on performance

### Requirements
- **Minimum**: 4GB RAM, DirectX 11, WebGL 2.0
- **Recommended**: 8GB RAM, DirectX 12, VR Ready GPU
- **VR**: SteamVR compatible headset, 6DOF tracking

## 🤝 Contributing

### Development Setup
```bash
# Install development dependencies
npm install --dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Style
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety (optional)
- **JSDoc**: Documentation comments

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Three.js**: 3D graphics library
- **React**: UI framework
- **WebLLM**: AI integration
- **SteamVR**: VR platform
- **VRChat**: Social VR platform
- **OSC**: Open Sound Control protocol

## 📞 Support

For support, questions, or feature requests:
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: Wiki pages
- **Community**: Discord server

---

**Jena AI VTuber System** - Bringing AI to life through virtual interaction and control.