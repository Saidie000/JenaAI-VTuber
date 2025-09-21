import { create } from 'zustand';
import * as db from './indexedDB.js';

export const useAvatarStore = create((set, get) => ({
  // Model state
  modelUrl: null,
  model: null,
  mixer: null,
  isLoading: false,
  
  // Eye gaze control
  eyeGaze: { x: 0, y: 0 },
  
  // Facial expressions (morph targets)
  facialExpressions: {
    smile: 0,
    frown: 0,
    surprised: 0,
    angry: 0,
    sad: 0,
    happy: 0,
    mouthOpen: 0,
    mouthSmile: 0,
    mouthFrown: 0,
    mouthPucker: 0,
    mouthFunnel: 0,
    mouthLeft: 0,
    mouthRight: 0,
    jawOpen: 0,
    jawForward: 0,
    jawLeft: 0,
    jawRight: 0,
    cheekPuff: 0,
    cheekSquint: 0,
    tongueOut: 0,
    lipRollUpper: 0,
    lipRollLower: 0,
  },
  
  // Skeletal controls (bone rotations)
  skeletalControls: {
    head: { x: 0, y: 0, z: 0 },
    neck: { x: 0, y: 0, z: 0 },
    headTilt: { x: 0, y: 0, z: 0 },
    headNod: { x: 0, y: 0, z: 0 },
    headShake: { x: 0, y: 0, z: 0 },
    leftShoulder: { x: 0, y: 0, z: 0 },
    rightShoulder: { x: 0, y: 0, z: 0 },
    leftArm: { x: 0, y: 0, z: 0 },
    rightArm: { x: 0, y: 0, z: 0 },
    leftForearm: { x: 0, y: 0, z: 0 },
    rightForearm: { x: 0, y: 0, z: 0 },
    spine: { x: 0, y: 0, z: 0 },
    hips: { x: 0, y: 0, z: 0 },
  },
  
  // Voice settings
  voiceSettings: {
    intensity: 50,
    pitch: 1.0,
    speed: 1.0,
    volume: 1.0,
    emotion: 'neutral',
    type: 'normal'
  },
  
  // Animation history
  animationHistory: [],
  
  // Actions
  setModelUrl: (url) => {
    set({ modelUrl: url });
    // Save to IndexedDB
    db.saveAvatarConfig({ modelUrl: url });
  },
  
  setModel: (model) => set({ model }),
  
  setMixer: (mixer) => set({ mixer }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setEyeGaze: (gaze) => {
    set((state) => ({ eyeGaze: { ...state.eyeGaze, ...gaze } }));
    // Save movement to IndexedDB
    db.saveMovement({ type: 'gaze', data: gaze });
  },
  
  setFacialExpressions: (expressions) => {
    set((state) => ({ facialExpressions: { ...state.facialExpressions, ...expressions } }));
    // Save expression to IndexedDB
    db.saveExpression({ 
      emotion: expressions.emotion || 'neutral', 
      data: expressions 
    });
  },
  
  setSkeletalControls: (controls) => {
    set((state) => ({ skeletalControls: { ...state.skeletalControls, ...controls } }));
    // Save movement to IndexedDB
    db.saveMovement({ type: 'skeletal', data: controls });
  },
  
  setVoiceSettings: (settings) => {
    set((state) => ({ voiceSettings: { ...state.voiceSettings, ...settings } }));
    // Save voice settings to IndexedDB
    db.saveVoiceSettings(settings);
  },
  
  addToAnimationHistory: (animation) => {
    set((state) => ({ 
      animationHistory: [...state.animationHistory, animation].slice(-100) // Keep last 100
    }));
    // Save animation to IndexedDB
    db.saveAnimation(animation);
  },
  
  resetAvatar: () => {
    set({
      eyeGaze: { x: 0, y: 0 },
      facialExpressions: {
        smile: 0,
        frown: 0,
        surprised: 0,
        angry: 0,
        sad: 0,
        happy: 0,
        mouthOpen: 0,
        mouthSmile: 0,
        mouthFrown: 0,
        mouthPucker: 0,
        mouthFunnel: 0,
        mouthLeft: 0,
        mouthRight: 0,
        jawOpen: 0,
        jawForward: 0,
        jawLeft: 0,
        jawRight: 0,
        cheekPuff: 0,
        cheekSquint: 0,
        tongueOut: 0,
        lipRollUpper: 0,
        lipRollLower: 0,
      },
      skeletalControls: {
        head: { x: 0, y: 0, z: 0 },
        neck: { x: 0, y: 0, z: 0 },
        headTilt: { x: 0, y: 0, z: 0 },
        headNod: { x: 0, y: 0, z: 0 },
        headShake: { x: 0, y: 0, z: 0 },
        leftShoulder: { x: 0, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: 0 },
        leftArm: { x: 0, y: 0, z: 0 },
        rightArm: { x: 0, y: 0, z: 0 },
        leftForearm: { x: 0, y: 0, z: 0 },
        rightForearm: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        hips: { x: 0, y: 0, z: 0 },
      },
      voiceSettings: {
        intensity: 50,
        pitch: 1.0,
        speed: 1.0,
        volume: 1.0,
        emotion: 'neutral',
        type: 'normal'
      }
    });
  },
  
  // Load data from IndexedDB
  loadFromIndexedDB: async () => {
    try {
      // Load avatar config
      const avatarConfigs = await db.getAvatarConfig();
      if (avatarConfigs.length > 0) {
        const latestConfig = avatarConfigs[avatarConfigs.length - 1];
        if (latestConfig.modelUrl) {
          set({ modelUrl: latestConfig.modelUrl });
        }
      }
      
      // Load voice settings
      const voiceSettings = await db.getVoiceSettings();
      if (voiceSettings.length > 0) {
        const latestSettings = voiceSettings[voiceSettings.length - 1];
        set({ voiceSettings: latestSettings });
      }
      
      // Load animation history
      const animations = await db.getAnimations();
      set({ animationHistory: animations });
      
    } catch (error) {
      console.error('Failed to load data from IndexedDB:', error);
    }
  }
}));
