import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useAvatarStore } from '../store/avatarStore.js';
import { movementService, expressionService } from '../services/animationService.js';

export const Scene3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const loadedModelRef = useRef(null);
  const mixerRef = useRef(null);
  
  const {
    modelUrl,
    isLoading,
    eyeGaze,
    facialExpressions,
    skeletalControls,
    setModel,
    setMixer,
    setIsLoading
  } = useAvatarStore();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Add gradient background
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, 500.0, 0.0)).y;
          vec3 color1 = vec3(0.1, 0.1, 0.18);
          vec3 color2 = vec3(0.05, 0.05, 0.1);
          vec3 color3 = vec3(0.1, 0.05, 0.15);
          vec3 finalColor = mix(mix(color2, color1, max(pow(max(h, 0.0), 0.6), 0.0)), color3, 0.3);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const skybox = new THREE.Mesh(geometry, material);
    scene.add(skybox);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 3);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0);
    controls.maxDistance = 10;
    controls.minDistance = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x6366f1, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.5
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Floating particles
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = Math.random() * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const clock = new THREE.Clock();
    
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      particles,
      clock
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      
      // Animate particles
      particles.rotation.y = elapsed * 0.1;
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    // Window resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Load model when URL changes
  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return;

    const { scene, THREE } = sceneRef.current;
    setIsLoading(true);

    // Clean up previous model
    if (loadedModelRef.current) {
      scene.remove(loadedModelRef.current);
    }
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
    }

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.userData.isModel = true;

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        model.position.sub(center);
        
        // Scale to reasonable size
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          model.scale.multiplyScalar(2 / maxDim);
        }

        // Enable shadows and enhance materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        scene.add(model);
        loadedModelRef.current = model;
        setModel(model);

        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
          mixerRef.current = mixer;
          setMixer(mixer);
        }

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        setIsLoading(false);
        
        // Create error placeholder
        const { THREE } = sceneRef.current;
        const geometry = new THREE.ConeGeometry(0.5, 1, 8);
        const material = new THREE.MeshPhongMaterial({ color: 0xef4444 });
        const errorCone = new THREE.Mesh(geometry, material);
        errorCone.userData.isModel = true;
        errorCone.position.set(0, 1, 0);
        scene.add(errorCone);
        loadedModelRef.current = errorCone;
      }
    );
  }, [modelUrl, setModel, setMixer, setIsLoading]);

  // Apply avatar controls
  useEffect(() => {
    if (!loadedModelRef.current || !sceneRef.current) return;

    const model = loadedModelRef.current;
    
    // Record movement
    movementService.recordMovement('gaze', eyeGaze);
    expressionService.recordExpression('current', facialExpressions);

    model.traverse((child) => {
      // Apply eye gaze
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        if (name.includes('eye') || name.includes('pupil')) {
          child.rotation.x = eyeGaze.y * 0.3;
          child.rotation.y = eyeGaze.x * 0.3;
        }
      }
      
      // Apply facial expressions via morph targets
      if (child.isMesh && child.morphTargetInfluences) {
        Object.entries(facialExpressions).forEach(([expression, value]) => {
          const variations = [
            expression,
            expression.toLowerCase(),
            expression.toUpperCase(),
            expression.charAt(0).toUpperCase() + expression.slice(1),
            expression.replace(/([A-Z])/g, '_$1').toLowerCase(),
            expression.replace(/([A-Z])/g, '-$1').toLowerCase()
          ];
          
          variations.forEach(variant => {
            const morphIndex = child.morphTargetDictionary?.[variant];
            if (morphIndex !== undefined) {
              child.morphTargetInfluences[morphIndex] = value;
            }
          });
        });
      }
      
      // Apply skeletal controls
      if (child.isBone) {
        const boneName = child.name.toLowerCase();
        Object.entries(skeletalControls).forEach(([joint, rotation]) => {
          const jointVariations = [
            joint.toLowerCase(),
            joint.replace(/([A-Z])/g, '_$1').toLowerCase(),
            joint.replace(/([A-Z])/g, '-$1').toLowerCase(),
            joint.replace(/([A-Z])/g, ' $1').toLowerCase(),
            `mixamorig${joint.toLowerCase()}`,
            `mixamorig_${joint.toLowerCase()}`
          ];
          
          const matchesJoint = jointVariations.some(variant => 
            boneName.includes(variant) || 
            boneName === variant ||
            boneName.startsWith(variant) ||
            boneName.endsWith(variant)
          );
          
          if (matchesJoint) {
            child.rotation.x = rotation.x;
            child.rotation.y = rotation.y;
            child.rotation.z = rotation.z;
          }
        });
      }

      // Apply enhanced head controls with better bone matching
      if (child.isBone) {
        const boneName = child.name.toLowerCase();

        // Head rotation controls
        if (boneName.includes('head') || boneName.includes('skull')) {
          child.rotation.x += skeletalControls.headTilt.x + skeletalControls.headNod.x;
          child.rotation.y += skeletalControls.headTilt.y + skeletalControls.headShake.y;
          child.rotation.z += skeletalControls.headTilt.z + skeletalControls.headShake.z;
        }

        // Neck controls
        if (boneName.includes('neck') || boneName.includes('cervical')) {
          child.rotation.x += skeletalControls.neck.x;
          child.rotation.y += skeletalControls.neck.y;
          child.rotation.z += skeletalControls.neck.z;
        }
      }
    });
  }, [eyeGaze, facialExpressions, skeletalControls]);

  return <div ref={mountRef} className="absolute inset-0" />;
};
