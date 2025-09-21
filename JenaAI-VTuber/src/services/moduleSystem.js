/**
 * Dynamic Module System with Hot-Swapping and WebSocket Support
 * Allows real-time loading, unloading, and updating of modules without restart
 */

class ModuleSystem {
  constructor() {
    this.modules = new Map();
    this.moduleStates = new Map();
    this.dependencies = new Map();
    this.loadedModules = new Set();
    this.moduleQueue = [];
    this.isProcessing = false;
    this.eventListeners = new Map();
    this.websocket = null;
    this.serverUrl = 'ws://localhost:8080';
  }

  // Initialize WebSocket connection
  async initializeWebSocket() {
    try {
      this.websocket = new WebSocket(this.serverUrl);
      
      this.websocket.onopen = () => {
        console.log('Module system WebSocket connected');
        this.sendMessage({ type: 'register', clientType: 'avatar-system' });
      };

      this.websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      };

      this.websocket.onclose = () => {
        console.log('Module system WebSocket disconnected, attempting reconnect...');
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Send message to WebSocket server
  sendMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'module_update':
        this.handleModuleUpdate(message.data);
        break;
      case 'module_install':
        this.handleModuleInstall(message.data);
        break;
      case 'module_uninstall':
        this.handleModuleUninstall(message.data);
        break;
      case 'module_reload':
        this.handleModuleReload(message.data);
        break;
      case 'system_command':
        this.handleSystemCommand(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Register a module
  registerModule(moduleId, moduleConfig) {
    const module = {
      id: moduleId,
      name: moduleConfig.name,
      version: moduleConfig.version,
      dependencies: moduleConfig.dependencies || [],
      exports: moduleConfig.exports || {},
      init: moduleConfig.init || (() => {}),
      destroy: moduleConfig.destroy || (() => {}),
      update: moduleConfig.update || (() => {}),
      config: moduleConfig.config || {},
      state: 'registered',
      lastUpdated: Date.now()
    };

    this.modules.set(moduleId, module);
    this.moduleStates.set(moduleId, 'registered');
    
    console.log(`Module ${moduleId} registered`);
    return module;
  }

  // Load a module
  async loadModule(moduleId, options = {}) {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (this.loadedModules.has(moduleId)) {
      console.log(`Module ${moduleId} already loaded`);
      return module;
    }

    try {
      // Check dependencies
      await this.checkDependencies(moduleId);
      
      // Initialize module
      if (module.init) {
        await module.init(options);
      }

      this.loadedModules.add(moduleId);
      this.moduleStates.set(moduleId, 'loaded');
      module.state = 'loaded';

      // Emit module loaded event
      this.emit('moduleLoaded', { moduleId, module });

      console.log(`Module ${moduleId} loaded successfully`);
      return module;
    } catch (error) {
      console.error(`Failed to load module ${moduleId}:`, error);
      throw error;
    }
  }

  // Unload a module
  async unloadModule(moduleId) {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (!this.loadedModules.has(moduleId)) {
      console.log(`Module ${moduleId} not loaded`);
      return;
    }

    try {
      // Check if other modules depend on this one
      const dependents = this.getDependents(moduleId);
      if (dependents.length > 0) {
        throw new Error(`Cannot unload ${moduleId}: ${dependents.join(', ')} depend on it`);
      }

      // Destroy module
      if (module.destroy) {
        await module.destroy();
      }

      this.loadedModules.delete(moduleId);
      this.moduleStates.set(moduleId, 'unloaded');
      module.state = 'unloaded';

      // Emit module unloaded event
      this.emit('moduleUnloaded', { moduleId, module });

      console.log(`Module ${moduleId} unloaded successfully`);
    } catch (error) {
      console.error(`Failed to unload module ${moduleId}:`, error);
      throw error;
    }
  }

  // Hot-swap a module (update without unloading)
  async hotSwapModule(moduleId, newModuleConfig) {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (!this.loadedModules.has(moduleId)) {
      throw new Error(`Module ${moduleId} not loaded`);
    }

    try {
      // Update module configuration
      const oldModule = { ...module };
      Object.assign(module, newModuleConfig);
      module.lastUpdated = Date.now();

      // Call update method if available
      if (module.update) {
        await module.update(oldModule, module);
      }

      // Emit module updated event
      this.emit('moduleUpdated', { moduleId, oldModule, newModule: module });

      console.log(`Module ${moduleId} hot-swapped successfully`);
      return module;
    } catch (error) {
      console.error(`Failed to hot-swap module ${moduleId}:`, error);
      throw error;
    }
  }

  // Check module dependencies
  async checkDependencies(moduleId) {
    const module = this.modules.get(moduleId);
    if (!module) return;

    // Check for circular dependencies
    const visited = new Set();
    const visiting = new Set();
    
    const checkCircular = (currentId, targetId) => {
      if (visiting.has(currentId)) {
        throw new Error(`Circular dependency detected: ${currentId} -> ${targetId}`);
      }
      if (visited.has(currentId)) return;
      
      visiting.add(currentId);
      const currentModule = this.modules.get(currentId);
      if (currentModule) {
        for (const depId of currentModule.dependencies) {
          if (depId === targetId) {
            throw new Error(`Circular dependency detected: ${currentId} -> ${depId}`);
          }
          checkCircular(depId, targetId);
        }
      }
      visiting.delete(currentId);
      visited.add(currentId);
    };

    // Check circular dependencies for this module
    checkCircular(moduleId, moduleId);

    // Load dependencies in correct order
    const dependencyOrder = this.getDependencyOrder(module.dependencies);
    
    for (const depId of dependencyOrder) {
      if (!this.loadedModules.has(depId)) {
        await this.loadModule(depId);
      }
    }
  }

  // Get dependency loading order using topological sort
  getDependencyOrder(dependencies) {
    const visited = new Set();
    const visiting = new Set();
    const order = [];

    const visit = (depId) => {
      if (visiting.has(depId)) {
        throw new Error(`Circular dependency detected: ${depId}`);
      }
      if (visited.has(depId)) return;
      
      visiting.add(depId);
      
      const depModule = this.modules.get(depId);
      if (depModule) {
        for (const subDepId of depModule.dependencies) {
          visit(subDepId);
        }
      }
      
      visiting.delete(depId);
      visited.add(depId);
      order.push(depId);
    };

    dependencies.forEach(visit);
    return order;
  }

  // Get modules that depend on a given module
  getDependents(moduleId) {
    const dependents = [];
    for (const [id, module] of this.modules) {
      if (module.dependencies.includes(moduleId)) {
        dependents.push(id);
      }
    }
    return dependents;
  }

  // Get module by ID
  getModule(moduleId) {
    return this.modules.get(moduleId);
  }

  // Get all loaded modules
  getLoadedModules() {
    return Array.from(this.loadedModules).map(id => this.modules.get(id));
  }

  // Get module state
  getModuleState(moduleId) {
    return this.moduleStates.get(moduleId);
  }

  // Handle module update from WebSocket
  async handleModuleUpdate(data) {
    const { moduleId, moduleConfig, action } = data;
    
    try {
      switch (action) {
        case 'install':
          await this.handleModuleInstall(data);
          break;
        case 'update':
          await this.hotSwapModule(moduleId, moduleConfig);
          break;
        case 'uninstall':
          await this.handleModuleUninstall(data);
          break;
        case 'reload':
          await this.handleModuleReload(data);
          break;
      }
    } catch (error) {
      console.error(`Failed to handle module update for ${moduleId}:`, error);
      this.sendMessage({
        type: 'module_error',
        data: { moduleId, error: error.message }
      });
    }
  }

  // Handle module install
  async handleModuleInstall(data) {
    const { moduleId, moduleConfig } = data;
    this.registerModule(moduleId, moduleConfig);
    await this.loadModule(moduleId);
  }

  // Handle module uninstall
  async handleModuleUninstall(data) {
    const { moduleId } = data;
    await this.unloadModule(moduleId);
    this.modules.delete(moduleId);
    this.moduleStates.delete(moduleId);
  }

  // Handle module reload
  async handleModuleReload(data) {
    const { moduleId } = data;
    const wasLoaded = this.loadedModules.has(moduleId);
    
    if (wasLoaded) {
      await this.unloadModule(moduleId);
    }
    
    // Re-register and load
    const moduleConfig = data.moduleConfig;
    this.registerModule(moduleId, moduleConfig);
    
    if (wasLoaded) {
      await this.loadModule(moduleId);
    }
  }

  // Handle system commands
  async handleSystemCommand(data) {
    const { command, args } = data;
    
    switch (command) {
      case 'list_modules':
        this.sendMessage({
          type: 'module_list',
          data: {
            modules: Array.from(this.modules.values()),
            loaded: Array.from(this.loadedModules)
          }
        });
        break;
      case 'get_module_info':
        const module = this.getModule(args.moduleId);
        this.sendMessage({
          type: 'module_info',
          data: { moduleId: args.moduleId, module }
        });
        break;
      case 'restart_system':
        await this.restartSystem();
        break;
    }
  }

  // Restart the entire system
  async restartSystem() {
    console.log('Restarting module system...');
    
    // Unload all modules
    for (const moduleId of this.loadedModules) {
      try {
        await this.unloadModule(moduleId);
      } catch (error) {
        console.error(`Error unloading ${moduleId}:`, error);
      }
    }
    
    // Clear all state
    this.modules.clear();
    this.moduleStates.clear();
    this.loadedModules.clear();
    
    // Emit system restart event
    this.emit('systemRestart');
    
    console.log('Module system restarted');
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Save module state to persistent storage
  async saveModuleState(moduleId, state) {
    try {
      const module = this.modules.get(moduleId);
      if (!module) {
        throw new Error(`Module ${moduleId} not found`);
      }

      // Store state in memory
      this.moduleStates.set(moduleId, {
        ...state,
        timestamp: Date.now(),
        version: module.version
      });

      // Save to IndexedDB for persistence
      if (typeof window !== 'undefined' && window.indexedDB) {
        await this.saveStateToIndexedDB(moduleId, state);
      }

      console.log(`State saved for module ${moduleId}`);
      return true;
    } catch (error) {
      console.error(`Failed to save state for module ${moduleId}:`, error);
      return false;
    }
  }

  // Restore module state from persistent storage
  async restoreModuleState(moduleId) {
    try {
      const module = this.modules.get(moduleId);
      if (!module) {
        throw new Error(`Module ${moduleId} not found`);
      }

      // Try to restore from IndexedDB first
      let state = null;
      if (typeof window !== 'undefined' && window.indexedDB) {
        state = await this.loadStateFromIndexedDB(moduleId);
      }

      // Fallback to memory state
      if (!state) {
        state = this.moduleStates.get(moduleId);
      }

      if (state && module.restoreState) {
        await module.restoreState(state);
        console.log(`State restored for module ${moduleId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to restore state for module ${moduleId}:`, error);
      return false;
    }
  }

  // Save all module states
  async saveAllModuleStates() {
    const results = {};
    
    for (const [moduleId, module] of this.modules) {
      if (module.saveState) {
        try {
          const state = await module.saveState();
          await this.saveModuleState(moduleId, state);
          results[moduleId] = { success: true, state };
        } catch (error) {
          results[moduleId] = { success: false, error: error.message };
        }
      }
    }

    console.log(`Saved states for ${Object.keys(results).length} modules`);
    return results;
  }

  // Restore all module states
  async restoreAllModuleStates() {
    const results = {};
    
    for (const [moduleId, module] of this.modules) {
      if (module.restoreState) {
        try {
          const success = await this.restoreModuleState(moduleId);
          results[moduleId] = { success };
        } catch (error) {
          results[moduleId] = { success: false, error: error.message };
        }
      }
    }

    console.log(`Restored states for ${Object.keys(results).length} modules`);
    return results;
  }

  // Save state to IndexedDB
  async saveStateToIndexedDB(moduleId, state) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ModuleStates', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['states'], 'readwrite');
        const store = transaction.objectStore('states');
        
        const stateData = {
          moduleId,
          state,
          timestamp: Date.now()
        };
        
        const putRequest = store.put(stateData);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('states')) {
          db.createObjectStore('states', { keyPath: 'moduleId' });
        }
      };
    });
  }

  // Load state from IndexedDB
  async loadStateFromIndexedDB(moduleId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ModuleStates', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['states'], 'readonly');
        const store = transaction.objectStore('states');
        
        const getRequest = store.get(moduleId);
        getRequest.onsuccess = () => {
          resolve(getRequest.result ? getRequest.result.state : null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('states')) {
          db.createObjectStore('states', { keyPath: 'moduleId' });
        }
      };
    });
  }

  // Clear all persistent states
  async clearAllStates() {
    this.moduleStates.clear();
    
    if (typeof window !== 'undefined' && window.indexedDB) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('ModuleStates', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['states'], 'readwrite');
          const store = transaction.objectStore('states');
          
          const clearRequest = store.clear();
          clearRequest.onsuccess = () => resolve();
          clearRequest.onerror = () => reject(clearRequest.error);
        };
        
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Get dependency graph
  getDependencyGraph() {
    const graph = {};
    
    for (const [moduleId, module] of this.modules) {
      graph[moduleId] = {
        name: module.name,
        version: module.version,
        dependencies: module.dependencies,
        dependents: this.getDependents(moduleId),
        loaded: this.loadedModules.has(moduleId),
        hasState: this.moduleStates.has(moduleId),
        state: this.moduleStates.get(moduleId)
      };
    }
    
    return graph;
  }

  // Validate dependency graph
  validateDependencyGraph() {
    const errors = [];
    const visited = new Set();
    const visiting = new Set();
    
    const visit = (moduleId) => {
      if (visiting.has(moduleId)) {
        errors.push(`Circular dependency detected: ${moduleId}`);
        return;
      }
      if (visited.has(moduleId)) return;
      
      visiting.add(moduleId);
      const module = this.modules.get(moduleId);
      if (module) {
        for (const depId of module.dependencies) {
          if (!this.modules.has(depId)) {
            errors.push(`Missing dependency: ${moduleId} depends on ${depId} (not found)`);
          } else {
            visit(depId);
          }
        }
      }
      visiting.delete(moduleId);
      visited.add(moduleId);
    };
    
    for (const moduleId of this.modules.keys()) {
      visit(moduleId);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get system status
  getSystemStatus() {
    const dependencyValidation = this.validateDependencyGraph();
    
    return {
      totalModules: this.modules.size,
      loadedModules: this.loadedModules.size,
      websocketConnected: this.websocket && this.websocket.readyState === WebSocket.OPEN,
      dependencyValid: dependencyValidation.isValid,
      dependencyErrors: dependencyValidation.errors,
      modules: Array.from(this.modules.values()).map(m => ({
        id: m.id,
        name: m.name,
        version: m.version,
        state: m.state,
        lastUpdated: m.lastUpdated,
        hasState: this.moduleStates.has(m.id),
        dependencies: m.dependencies,
        dependents: this.getDependents(m.id)
      }))
    };
  }
}

// Create singleton instance
export const moduleSystem = new ModuleSystem();

// Initialize WebSocket on import
moduleSystem.initializeWebSocket();
