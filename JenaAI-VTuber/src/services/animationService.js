import * as db from '../store/indexedDB.js';

class AnimationService {
  constructor() {
    this.animations = new Map();
    this.currentAnimation = null;
    this.isPlaying = false;
  }

  async loadAnimation(name, animationData) {
    try {
      // Store animation in IndexedDB
      await db.saveAnimation({
        name,
        data: animationData,
        timestamp: Date.now()
      });
      
      // Cache in memory
      this.animations.set(name, animationData);
      
      return true;
    } catch (error) {
      console.error('Failed to load animation:', error);
      return false;
    }
  }

  async getAnimation(name) {
    // Check memory cache first
    if (this.animations.has(name)) {
      return this.animations.get(name);
    }
    
    // Load from IndexedDB
    try {
      const animations = await db.getAnimations();
      const animation = animations.find(a => a.name === name);
      
      if (animation) {
        this.animations.set(name, animation.data);
        return animation.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get animation:', error);
      return null;
    }
  }

  async playAnimation(name, callback) {
    const animation = await this.getAnimation(name);
    if (!animation) {
      console.error(`Animation ${name} not found`);
      return false;
    }
    
    this.currentAnimation = name;
    this.isPlaying = true;
    
    // Simulate animation playback
    const duration = animation.duration || 1000;
    
    setTimeout(() => {
      this.isPlaying = false;
      if (callback) callback();
    }, duration);
    
    return true;
  }

  stopAnimation() {
    this.isPlaying = false;
    this.currentAnimation = null;
  }

  async getAllAnimations() {
    try {
      return await db.getAnimations();
    } catch (error) {
      console.error('Failed to get all animations:', error);
      return [];
    }
  }
}

class MovementService {
  constructor() {
    this.movementHistory = [];
  }

  async recordMovement(type, data) {
    try {
      const movement = {
        type,
        data,
        timestamp: Date.now()
      };
      
      // Store in IndexedDB
      await db.saveMovement(movement);
      
      // Add to history
      this.movementHistory.push(movement);
      
      // Keep only last 1000 movements
      if (this.movementHistory.length > 1000) {
        this.movementHistory = this.movementHistory.slice(-1000);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to record movement:', error);
      return false;
    }
  }

  async getRecentMovements(limit = 100) {
    try {
      return await db.getMovements(limit);
    } catch (error) {
      console.error('Failed to get recent movements:', error);
      return [];
    }
  }

  async getMovementsByType(type, limit = 100) {
    try {
      const allMovements = await db.getMovements();
      return allMovements
        .filter(m => m.type === type)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get movements by type:', error);
      return [];
    }
  }
}

class ExpressionService {
  constructor() {
    this.expressionHistory = [];
  }

  async recordExpression(emotion, data) {
    try {
      const expression = {
        emotion,
        data,
        timestamp: Date.now()
      };
      
      // Store in IndexedDB
      await db.saveExpression(expression);
      
      // Add to history
      this.expressionHistory.push(expression);
      
      // Keep only last 500 expressions
      if (this.expressionHistory.length > 500) {
        this.expressionHistory = this.expressionHistory.slice(-500);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to record expression:', error);
      return false;
    }
  }

  async getRecentExpressions(limit = 50) {
    try {
      return await db.getExpressions();
    } catch (error) {
      console.error('Failed to get recent expressions:', error);
      return [];
    }
  }

  async getExpressionsByEmotion(emotion) {
    try {
      return await db.getExpressions(emotion);
    } catch (error) {
      console.error('Failed to get expressions by emotion:', error);
      return [];
    }
  }
}

class OpenPoseService {
  constructor() {
    this.poseHistory = [];
  }

  async recordPose(poseData) {
    try {
      const pose = {
        keypoints: poseData.keypoints,
        confidence: poseData.confidence,
        timestamp: Date.now()
      };
      
      // Store in IndexedDB
      await db.saveOpenPose(pose);
      
      // Add to history
      this.poseHistory.push(pose);
      
      // Keep only last 200 poses
      if (this.poseHistory.length > 200) {
        this.poseHistory = this.poseHistory.slice(-200);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to record pose:', error);
      return false;
    }
  }

  async getRecentPoses(limit = 50) {
    try {
      return await db.getOpenPose(limit);
    } catch (error) {
      console.error('Failed to get recent poses:', error);
      return [];
    }
  }

  async analyzePoseTrends() {
    try {
      const poses = await db.getOpenPose(100);
      
      if (poses.length < 10) {
        return { message: 'Not enough data for analysis' };
      }
      
      // Analyze pose trends
      const recentPoses = poses.slice(-10);
      const avgConfidence = recentPoses.reduce((sum, pose) => sum + pose.confidence, 0) / recentPoses.length;
      
      // Detect common poses
      const poseCounts = {};
      recentPoses.forEach(pose => {
        const poseHash = JSON.stringify(pose.keypoints);
        poseCounts[poseHash] = (poseCounts[poseHash] || 0) + 1;
      });
      
      const mostCommonPose = Object.keys(poseCounts).reduce((a, b) => 
        poseCounts[a] > poseCounts[b] ? a : b
      );
      
      return {
        averageConfidence: avgConfidence,
        mostCommonPose: JSON.parse(mostCommonPose),
        poseFrequency: poseCounts[mostCommonPose] / recentPoses.length
      };
    } catch (error) {
      console.error('Failed to analyze pose trends:', error);
      return { message: 'Analysis failed' };
    }
  }
}

// Export service instances
export const animationService = new AnimationService();
export const movementService = new MovementService();
export const expressionService = new ExpressionService();
export const openPoseService = new OpenPoseService();
