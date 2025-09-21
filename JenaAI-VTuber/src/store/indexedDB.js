const DB_NAME = 'AvatarStorageDB';
const DB_VERSION = 1;
const STORES = {
  MOVEMENTS: 'movements',
  ANIMATIONS: 'animations',
  EXPRESSIONS: 'expressions',
  OPENPOSE: 'openpose',
  TTS: 'tts',
  VOICE_SETTINGS: 'voiceSettings',
  AVATAR_CONFIG: 'avatarConfig'
};

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject('Database error: ' + event.target.error);
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(STORES.MOVEMENTS)) {
        const movementsStore = db.createObjectStore(STORES.MOVEMENTS, { keyPath: 'id', autoIncrement: true });
        movementsStore.createIndex('timestamp', 'timestamp', { unique: false });
        movementsStore.createIndex('type', 'type', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.ANIMATIONS)) {
        const animationsStore = db.createObjectStore(STORES.ANIMATIONS, { keyPath: 'id', autoIncrement: true });
        animationsStore.createIndex('name', 'name', { unique: false });
        animationsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.EXPRESSIONS)) {
        const expressionsStore = db.createObjectStore(STORES.EXPRESSIONS, { keyPath: 'id', autoIncrement: true });
        expressionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        expressionsStore.createIndex('emotion', 'emotion', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.OPENPOSE)) {
        const openposeStore = db.createObjectStore(STORES.OPENPOSE, { keyPath: 'id', autoIncrement: true });
        openposeStore.createIndex('timestamp', 'timestamp', { unique: false });
        openposeStore.createIndex('confidence', 'confidence', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.TTS)) {
        const ttsStore = db.createObjectStore(STORES.TTS, { keyPath: 'id', autoIncrement: true });
        ttsStore.createIndex('timestamp', 'timestamp', { unique: false });
        ttsStore.createIndex('type', 'type', { unique: false });
        ttsStore.createIndex('emotion', 'emotion', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.VOICE_SETTINGS)) {
        const voiceSettingsStore = db.createObjectStore(STORES.VOICE_SETTINGS, { keyPath: 'id', autoIncrement: true });
        voiceSettingsStore.createIndex('name', 'name', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.AVATAR_CONFIG)) {
        const avatarConfigStore = db.createObjectStore(STORES.AVATAR_CONFIG, { keyPath: 'id', autoIncrement: true });
        avatarConfigStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const saveMovement = (movement) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MOVEMENTS], 'readwrite');
    const store = transaction.objectStore(STORES.MOVEMENTS);
    
    const request = store.add({
      ...movement,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getMovements = (limit = 100) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MOVEMENTS], 'readonly');
    const store = transaction.objectStore(STORES.MOVEMENTS);
    const index = store.index('timestamp');
    
    const request = index.openCursor(null, 'prev');
    const results = [];
    let count = 0;
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && count < limit) {
        results.push(cursor.value);
        cursor.continue();
        count++;
      } else {
        resolve(results);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
};

export const saveAnimation = (animation) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ANIMATIONS], 'readwrite');
    const store = transaction.objectStore(STORES.ANIMATIONS);
    
    const request = store.add({
      ...animation,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAnimations = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ANIMATIONS], 'readonly');
    const store = transaction.objectStore(STORES.ANIMATIONS);
    
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveExpression = (expression) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXPRESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.EXPRESSIONS);
    
    const request = store.add({
      ...expression,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getExpressions = (emotion = null) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXPRESSIONS], 'readonly');
    const store = transaction.objectStore(STORES.EXPRESSIONS);
    
    let request;
    if (emotion) {
      const index = store.index('emotion');
      request = index.getAll(emotion);
    } else {
      request = store.getAll();
    }
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveOpenPose = (openposeData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.OPENPOSE], 'readwrite');
    const store = transaction.objectStore(STORES.OPENPOSE);
    
    const request = store.add({
      ...openposeData,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getOpenPose = (limit = 50) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.OPENPOSE], 'readonly');
    const store = transaction.objectStore(STORES.OPENPOSE);
    const index = store.index('timestamp');
    
    const request = index.openCursor(null, 'prev');
    const results = [];
    let count = 0;
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && count < limit) {
        results.push(cursor.value);
        cursor.continue();
        count++;
      } else {
        resolve(results);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
};

export const saveTTS = (ttsData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TTS], 'readwrite');
    const store = transaction.objectStore(STORES.TTS);
    
    const request = store.add({
      ...ttsData,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getTTS = (type = null, emotion = null) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TTS], 'readonly');
    const store = transaction.objectStore(STORES.TTS);
    
    let request;
    if (type) {
      const index = store.index('type');
      request = index.getAll(type);
    } else if (emotion) {
      const index = store.index('emotion');
      request = index.getAll(emotion);
    } else {
      request = store.getAll();
    }
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveVoiceSettings = (settings) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VOICE_SETTINGS], 'readwrite');
    const store = transaction.objectStore(STORES.VOICE_SETTINGS);
    
    const request = store.add({
      ...settings,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getVoiceSettings = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VOICE_SETTINGS], 'readonly');
    const store = transaction.objectStore(STORES.VOICE_SETTINGS);
    
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveAvatarConfig = (config) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.AVATAR_CONFIG], 'readwrite');
    const store = transaction.objectStore(STORES.AVATAR_CONFIG);
    
    const request = store.add({
      ...config,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAvatarConfig = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.AVATAR_CONFIG], 'readonly');
    const store = transaction.objectStore(STORES.AVATAR_CONFIG);
    
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearAllData = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([
      STORES.MOVEMENTS,
      STORES.ANIMATIONS,
      STORES.EXPRESSIONS,
      STORES.OPENPOSE,
      STORES.TTS,
      STORES.VOICE_SETTINGS,
      STORES.AVATAR_CONFIG
    ], 'readwrite');
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
