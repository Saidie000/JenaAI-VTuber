/**
 * Module State Persistence Service
 * Handles saving and restoring module states across sessions
 */

class ModuleStatePersistence {
  constructor() {
    this.dbName = 'ModuleStateDB';
    this.dbVersion = 1;
    this.db = null;
    this.autoSaveInterval = null;
    this.autoSaveEnabled = true;
    this.autoSaveDelay = 30000; // 30 seconds
  }

  /**
   * Initialize IndexedDB for state persistence
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Module state persistence initialized');
        this.startAutoSave();
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('moduleStates')) {
          const stateStore = db.createObjectStore('moduleStates', { keyPath: 'moduleId' });
          stateStore.createIndex('timestamp', 'timestamp', { unique: false });
          stateStore.createIndex('version', 'version', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('stateHistory')) {
          const historyStore = db.createObjectStore('stateHistory', { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('moduleId', 'moduleId', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('stateSnapshots')) {
          const snapshotStore = db.createObjectStore('stateSnapshots', { keyPath: 'id', autoIncrement: true });
          snapshotStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Save module state
   */
  async saveModuleState(moduleId, state, options = {}) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const stateData = {
      moduleId,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      timestamp: Date.now(),
      version: options.version || '1.0.0',
      metadata: options.metadata || {}
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['moduleStates', 'stateHistory'], 'readwrite');
      
      // Save current state
      const stateStore = transaction.objectStore('moduleStates');
      const putRequest = stateStore.put(stateData);
      
      // Save to history
      const historyStore = transaction.objectStore('stateHistory');
      const historyData = {
        moduleId,
        state: stateData.state,
        timestamp: stateData.timestamp,
        version: stateData.version,
        metadata: stateData.metadata
      };
      const historyRequest = historyStore.add(historyData);
      
      putRequest.onsuccess = () => {
        console.log(`State saved for module ${moduleId}`);
        resolve(stateData);
      };
      
      putRequest.onerror = () => reject(putRequest.error);
      historyRequest.onerror = () => console.warn('Failed to save to history:', historyRequest.error);
    });
  }

  /**
   * Load module state
   */
  async loadModuleState(moduleId, version = null) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['moduleStates'], 'readonly');
      const store = transaction.objectStore('moduleStates');
      const request = store.get(moduleId);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Filter by version if specified
          if (version && result.version !== version) {
            resolve(null);
            return;
          }
          resolve(result.state);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all module states
   */
  async getAllModuleStates() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['moduleStates'], 'readonly');
      const store = transaction.objectStore('moduleStates');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const states = {};
        request.result.forEach(item => {
          states[item.moduleId] = item.state;
        });
        resolve(states);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get module state history
   */
  async getModuleStateHistory(moduleId, limit = 50) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stateHistory'], 'readonly');
      const store = transaction.objectStore('stateHistory');
      const index = store.index('moduleId');
      const request = index.getAll(moduleId);
      
      request.onsuccess = () => {
        const history = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(history);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Create a state snapshot
   */
  async createStateSnapshot(modules, options = {}) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const snapshot = {
      timestamp: Date.now(),
      modules: {},
      metadata: options.metadata || {}
    };

    // Collect states from all modules
    for (const [moduleId, module] of modules) {
      if (module.saveState) {
        try {
          const state = await module.saveState();
          snapshot.modules[moduleId] = state;
        } catch (error) {
          console.warn(`Failed to save state for module ${moduleId}:`, error);
        }
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stateSnapshots'], 'readwrite');
      const store = transaction.objectStore('stateSnapshots');
      const request = store.add(snapshot);
      
      request.onsuccess = () => {
        console.log('State snapshot created');
        resolve(snapshot);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Restore from state snapshot
   */
  async restoreFromSnapshot(snapshotId) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stateSnapshots'], 'readonly');
      const store = transaction.objectStore('stateSnapshots');
      const request = store.get(snapshotId);
      
      request.onsuccess = () => {
        const snapshot = request.result;
        if (snapshot) {
          resolve(snapshot);
        } else {
          reject(new Error('Snapshot not found'));
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all state snapshots
   */
  async getAllSnapshots(limit = 20) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stateSnapshots'], 'readonly');
      const store = transaction.objectStore('stateSnapshots');
      const index = store.index('timestamp');
      const request = index.getAll();
      
      request.onsuccess = () => {
        const snapshots = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(snapshots);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete module state
   */
  async deleteModuleState(moduleId) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['moduleStates'], 'readwrite');
      const store = transaction.objectStore('moduleStates');
      const request = store.delete(moduleId);
      
      request.onsuccess = () => {
        console.log(`State deleted for module ${moduleId}`);
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all states
   */
  async clearAllStates() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['moduleStates', 'stateHistory', 'stateSnapshots'], 'readwrite');
      
      const clearStateStore = transaction.objectStore('moduleStates').clear();
      const clearHistoryStore = transaction.objectStore('stateHistory').clear();
      const clearSnapshotStore = transaction.objectStore('stateSnapshots').clear();
      
      let completed = 0;
      const onComplete = () => {
        completed++;
        if (completed === 3) {
          console.log('All states cleared');
          resolve();
        }
      };
      
      clearStateStore.onsuccess = onComplete;
      clearHistoryStore.onsuccess = onComplete;
      clearSnapshotStore.onsuccess = onComplete;
      
      clearStateStore.onerror = () => reject(clearStateStore.error);
      clearHistoryStore.onerror = () => reject(clearHistoryStore.error);
      clearSnapshotStore.onerror = () => reject(clearSnapshotStore.error);
    });
  }

  /**
   * Start auto-save functionality
   */
  startAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    if (this.autoSaveEnabled) {
      this.autoSaveInterval = setInterval(() => {
        this.autoSave();
      }, this.autoSaveDelay);
    }
  }

  /**
   * Stop auto-save functionality
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Auto-save all module states
   */
  async autoSave() {
    try {
      // This would need to be called with the module system instance
      console.log('Auto-saving module states...');
      // Implementation would depend on how modules are accessed
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * Set auto-save settings
   */
  setAutoSaveSettings(enabled, delay = null) {
    this.autoSaveEnabled = enabled;
    if (delay !== null) {
      this.autoSaveDelay = delay;
    }
    
    if (enabled) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const stats = {
      moduleStates: 0,
      stateHistory: 0,
      stateSnapshots: 0,
      totalSize: 0
    };

    // Count module states
    const stateTransaction = this.db.transaction(['moduleStates'], 'readonly');
    const stateStore = stateTransaction.objectStore('moduleStates');
    const stateCount = await new Promise((resolve) => {
      const request = stateStore.count();
      request.onsuccess = () => resolve(request.result);
    });
    stats.moduleStates = stateCount;

    // Count state history
    const historyTransaction = this.db.transaction(['stateHistory'], 'readonly');
    const historyStore = historyTransaction.objectStore('stateHistory');
    const historyCount = await new Promise((resolve) => {
      const request = historyStore.count();
      request.onsuccess = () => resolve(request.result);
    });
    stats.stateHistory = historyCount;

    // Count state snapshots
    const snapshotTransaction = this.db.transaction(['stateSnapshots'], 'readonly');
    const snapshotStore = snapshotTransaction.objectStore('stateSnapshots');
    const snapshotCount = await new Promise((resolve) => {
      const request = snapshotStore.count();
      request.onsuccess = () => resolve(request.result);
    });
    stats.stateSnapshots = snapshotCount;

    return stats;
  }

  /**
   * Clean up old state history
   */
  async cleanupOldHistory(daysToKeep = 30) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stateHistory'], 'readwrite');
      const store = transaction.objectStore('stateHistory');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);
      
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`Cleaned up ${deletedCount} old state history entries`);
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
export const moduleStatePersistence = new ModuleStatePersistence();

// Initialize on import
if (typeof window !== 'undefined') {
  moduleStatePersistence.initialize().catch(error => {
    console.error('Failed to initialize module state persistence:', error);
  });
}
