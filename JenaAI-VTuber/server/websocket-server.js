/**
 * WebSocket Server for Dynamic Module Management
 * Handles real-time module updates, AI commands, and system control
 */

const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');

class ModuleWebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = null;
    this.clients = new Map();
    this.moduleRegistry = new Map();
    this.moduleFiles = new Map();
    this.systemStatus = {
      running: true,
      modulesLoaded: 0,
      lastUpdate: Date.now()
    };
    
    this.init();
  }

  async init() {
    // Create WebSocket server
    this.wss = new WebSocket.Server({ port: this.port });
    
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws,
        id: clientId,
        type: 'unknown',
        lastPing: Date.now()
      });

      console.log(`Client ${clientId} connected from ${req.socket.remoteAddress}`);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Error parsing message:', error);
          this.sendError(ws, 'Invalid JSON message');
        }
      });

      ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: 'welcome',
        data: { clientId, serverTime: Date.now() }
      });
    });

    // Start ping/pong to keep connections alive
    this.startHeartbeat();
    
    // Watch for file changes
    this.startFileWatcher();
    
    console.log(`Module WebSocket Server running on port ${this.port}`);
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'register':
        this.handleClientRegister(clientId, message);
        break;
      case 'module_install':
        this.handleModuleInstall(clientId, message);
        break;
      case 'module_update':
        this.handleModuleUpdate(clientId, message);
        break;
      case 'module_uninstall':
        this.handleModuleUninstall(clientId, message);
        break;
      case 'module_reload':
        this.handleModuleReload(clientId, message);
        break;
      case 'system_command':
        this.handleSystemCommand(clientId, message);
        break;
      case 'ai_command':
        this.handleAICommand(clientId, message);
        break;
      case 'ping':
        this.handlePing(clientId, message);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  handleClientRegister(clientId, message) {
    const client = this.clients.get(clientId);
    client.type = message.clientType || 'unknown';
    client.registered = true;
    
    console.log(`Client ${clientId} registered as ${client.type}`);
    
    this.sendMessage(client.ws, {
      type: 'registered',
      data: { clientId, systemStatus: this.systemStatus }
    });
  }

  async handleModuleInstall(clientId, message) {
    const { moduleId, moduleConfig, source } = message.data;
    
    try {
      // Validate module configuration
      if (!this.validateModuleConfig(moduleConfig)) {
        throw new Error('Invalid module configuration');
      }

      // Store module in registry
      this.moduleRegistry.set(moduleId, {
        ...moduleConfig,
        installedAt: Date.now(),
        source: source || 'websocket'
      });

      // If source is file, watch for changes
      if (source === 'file' && moduleConfig.filePath) {
        this.watchModuleFile(moduleId, moduleConfig.filePath);
      }

      // Broadcast to all clients
      this.broadcast({
        type: 'module_install',
        data: { moduleId, moduleConfig, installedBy: clientId }
      });

      console.log(`Module ${moduleId} installed by client ${clientId}`);
      
      this.sendMessage(this.clients.get(clientId).ws, {
        type: 'module_installed',
        data: { moduleId, success: true }
      });

    } catch (error) {
      console.error(`Failed to install module ${moduleId}:`, error);
      this.sendError(this.clients.get(clientId).ws, `Failed to install module: ${error.message}`);
    }
  }

  async handleModuleUpdate(clientId, message) {
    const { moduleId, moduleConfig, action } = message.data;
    
    try {
      if (!this.moduleRegistry.has(moduleId)) {
        throw new Error(`Module ${moduleId} not found`);
      }

      // Update module configuration
      const existingModule = this.moduleRegistry.get(moduleId);
      const updatedModule = {
        ...existingModule,
        ...moduleConfig,
        lastUpdated: Date.now()
      };

      this.moduleRegistry.set(moduleId, updatedModule);

      // Broadcast update to all clients
      this.broadcast({
        type: 'module_update',
        data: { moduleId, moduleConfig: updatedModule, action, updatedBy: clientId }
      });

      console.log(`Module ${moduleId} updated by client ${clientId}`);
      
    } catch (error) {
      console.error(`Failed to update module ${moduleId}:`, error);
      this.sendError(this.clients.get(clientId).ws, `Failed to update module: ${error.message}`);
    }
  }

  async handleModuleUninstall(clientId, message) {
    const { moduleId } = message.data;
    
    try {
      if (!this.moduleRegistry.has(moduleId)) {
        throw new Error(`Module ${moduleId} not found`);
      }

      // Remove from registry
      this.moduleRegistry.delete(moduleId);
      
      // Stop watching file if applicable
      if (this.moduleFiles.has(moduleId)) {
        this.moduleFiles.delete(moduleId);
      }

      // Broadcast to all clients
      this.broadcast({
        type: 'module_uninstall',
        data: { moduleId, uninstalledBy: clientId }
      });

      console.log(`Module ${moduleId} uninstalled by client ${clientId}`);
      
    } catch (error) {
      console.error(`Failed to uninstall module ${moduleId}:`, error);
      this.sendError(this.clients.get(clientId).ws, `Failed to uninstall module: ${error.message}`);
    }
  }

  async handleModuleReload(clientId, message) {
    const { moduleId } = message.data;
    
    try {
      if (!this.moduleRegistry.has(moduleId)) {
        throw new Error(`Module ${moduleId} not found`);
      }

      // Broadcast reload to all clients
      this.broadcast({
        type: 'module_reload',
        data: { moduleId, reloadedBy: clientId }
      });

      console.log(`Module ${moduleId} reloaded by client ${clientId}`);
      
    } catch (error) {
      console.error(`Failed to reload module ${moduleId}:`, error);
      this.sendError(this.clients.get(clientId).ws, `Failed to reload module: ${error.message}`);
    }
  }

  async handleSystemCommand(clientId, message) {
    const { command, args } = message.data;
    
    try {
      switch (command) {
        case 'list_modules':
          this.sendMessage(this.clients.get(clientId).ws, {
            type: 'module_list',
            data: {
              modules: Array.from(this.moduleRegistry.entries()).map(([id, config]) => ({
                id,
                ...config
              })),
              systemStatus: this.systemStatus
            }
          });
          break;
          
        case 'get_system_status':
          this.sendMessage(this.clients.get(clientId).ws, {
            type: 'system_status',
            data: this.systemStatus
          });
          break;
          
        case 'restart_system':
          await this.restartSystem();
          this.broadcast({
            type: 'system_restart',
            data: { restartedBy: clientId }
          });
          break;
          
        case 'execute_ai_command':
          await this.executeAICommand(args.command, args.context);
          break;
          
        default:
          throw new Error(`Unknown system command: ${command}`);
      }
    } catch (error) {
      console.error(`Failed to execute system command ${command}:`, error);
      this.sendError(this.clients.get(clientId).ws, `System command failed: ${error.message}`);
    }
  }

  async handleAICommand(clientId, message) {
    const { command, context, priority } = message.data;
    
    try {
      console.log(`AI Command received: ${command}`);
      
      // Process AI command and determine actions
      const actions = await this.processAICommand(command, context);
      
      // Execute actions
      for (const action of actions) {
        await this.executeAction(action);
      }
      
      // Broadcast AI command execution
      this.broadcast({
        type: 'ai_command_executed',
        data: { command, actions, executedBy: clientId }
      });
      
    } catch (error) {
      console.error(`Failed to execute AI command:`, error);
      this.sendError(this.clients.get(clientId).ws, `AI command failed: ${error.message}`);
    }
  }

  async processAICommand(command, context) {
    // This is where you'd integrate with your AI system
    // For now, we'll do simple pattern matching
    
    const actions = [];
    
    if (command.includes('install') && command.includes('module')) {
      const moduleMatch = command.match(/install\s+module\s+(\w+)/i);
      if (moduleMatch) {
        const moduleId = moduleMatch[1];
        actions.push({
          type: 'install_module',
          moduleId,
          config: this.generateModuleConfig(moduleId, context)
        });
      }
    }
    
    if (command.includes('update') && command.includes('module')) {
      const moduleMatch = command.match(/update\s+module\s+(\w+)/i);
      if (moduleMatch) {
        const moduleId = moduleMatch[1];
        actions.push({
          type: 'update_module',
          moduleId,
          config: this.generateModuleConfig(moduleId, context)
        });
      }
    }
    
    if (command.includes('restart') && command.includes('system')) {
      actions.push({
        type: 'restart_system'
      });
    }
    
    return actions;
  }

  generateModuleConfig(moduleId, context) {
    // Generate a basic module configuration based on context
    return {
      id: moduleId,
      name: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
      version: '1.0.0',
      dependencies: [],
      exports: {},
      config: context || {},
      init: `function() { console.log('${moduleId} initialized'); }`,
      destroy: `function() { console.log('${moduleId} destroyed'); }`,
      update: `function(oldConfig, newConfig) { console.log('${moduleId} updated'); }`
    };
  }

  async executeAction(action) {
    switch (action.type) {
      case 'install_module':
        await this.handleModuleInstall('ai', {
          data: {
            moduleId: action.moduleId,
            moduleConfig: action.config,
            source: 'ai'
          }
        });
        break;
      case 'update_module':
        await this.handleModuleUpdate('ai', {
          data: {
            moduleId: action.moduleId,
            moduleConfig: action.config,
            action: 'update'
          }
        });
        break;
      case 'restart_system':
        await this.restartSystem();
        break;
    }
  }

  async executeAICommand(command, context) {
    // Execute AI command (this would integrate with your AI system)
    console.log(`Executing AI command: ${command}`);
    return { success: true, result: 'Command executed' };
  }

  validateModuleConfig(config) {
    return config && 
           config.id && 
           config.name && 
           config.version &&
           typeof config.init === 'function';
  }

  watchModuleFile(moduleId, filePath) {
    // Watch for file changes and auto-reload modules
    const fullPath = path.resolve(filePath);
    this.moduleFiles.set(moduleId, fullPath);
    
    // In a real implementation, you'd use fs.watch or chokidar
    console.log(`Watching module file: ${fullPath}`);
  }

  startFileWatcher() {
    // Watch for changes in the modules directory
    const modulesDir = path.join(__dirname, 'modules');
    
    // In a real implementation, you'd set up file watching here
    console.log(`Watching modules directory: ${modulesDir}`);
  }

  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      for (const [clientId, client] of this.clients) {
        if (now - client.lastPing > 30000) { // 30 seconds
          console.log(`Client ${clientId} timed out`);
          client.ws.close();
          this.clients.delete(clientId);
        } else {
          this.sendMessage(client.ws, { type: 'ping' });
        }
      }
    }, 10000); // Ping every 10 seconds
  }

  handlePing(clientId, message) {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = Date.now();
      this.sendMessage(client.ws, { type: 'pong' });
    }
  }

  async restartSystem() {
    console.log('Restarting system...');
    this.systemStatus.running = false;
    this.systemStatus.lastUpdate = Date.now();
    
    // Clear module registry
    this.moduleRegistry.clear();
    this.moduleFiles.clear();
    
    // Notify all clients
    this.broadcast({
      type: 'system_restart',
      data: { timestamp: Date.now() }
    });
    
    // Restart system status
    setTimeout(() => {
      this.systemStatus.running = true;
      this.systemStatus.lastUpdate = Date.now();
    }, 1000);
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, error) {
    this.sendMessage(ws, {
      type: 'error',
      data: { error, timestamp: Date.now() }
    });
  }

  broadcast(message) {
    for (const [clientId, client] of this.clients) {
      this.sendMessage(client.ws, message);
    }
  }

  getStatus() {
    return {
      port: this.port,
      clients: this.clients.size,
      modules: this.moduleRegistry.size,
      systemStatus: this.systemStatus
    };
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new ModuleWebSocketServer(8080);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');
    server.wss.close();
    process.exit(0);
  });
}

module.exports = ModuleWebSocketServer;
