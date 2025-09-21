import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, Smile, User, RotateCcw, MessageCircle, Music, Heart, Move, MousePointer2 } from 'lucide-react';
import { useAvatarStore } from '../store/avatarStore.js';

export default function AvatarController({ currentModel }) {
  const [eyeGaze, setEyeGaze] = useState({ x: 0, y: 0 });
  const [expressions, setExpressions] = useState({
    smile: 0,
    frown: 0,
    surprised: 0,
    angry: 0,
    sad: 0,
    happy: 0,
    // Mouth controls
    mouthOpen: 0,
    mouthSmile: 0,
    mouthFrown: 0,
    mouthPucker: 0,
    mouthFunnel: 0,
    mouthLeft: 0,
    mouthRight: 0,
    // Jaw controls
    jawOpen: 0,
    jawForward: 0,
    jawLeft: 0,
    jawRight: 0,
    // Additional face controls
    cheekPuff: 0,
    cheekSquint: 0,
    tongueOut: 0,
    lipRollUpper: 0,
    lipRollLower: 0,
  });

  const [skeletalControls, setSkeletalControls] = useState({
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
  });

  const gazeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const { setEyeGaze: setStoreEyeGaze, setFacialExpressions: setStoreFacialExpressions, setSkeletalControls: setStoreSkeletalControls } = useAvatarStore();

  // Handle gaze control
  const handleGazeMove = (e) => {
    if (!isDragging || !gazeRef.current) return;

    const rect = gazeRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    const newGaze = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    };

    setEyeGaze(newGaze);
    setStoreEyeGaze(newGaze);
  };

  // Preset configurations
  const presets = {
    talking: () => {
      const newExpressions = { 
        ...expressions, 
        mouthOpen: 0.3, 
        jawOpen: 0.2, 
        mouthSmile: 0.1 
      };
      setExpressions(newExpressions);
      setStoreFacialExpressions(newExpressions);

      const newSkeletal = { 
        ...skeletalControls, 
        headNod: { x: 0.1, y: 0, z: 0 }, 
        headTilt: { x: 0, y: 0.05, z: 0 } 
      };
      setSkeletalControls(newSkeletal);
      setStoreSkeletalControls(newSkeletal);
    },
    singing: () => {
      const newExpressions = { 
        ...expressions, 
        mouthOpen: 0.6, 
        mouthFunnel: 0.4, 
        jawOpen: 0.5, 
        happy: 0.3 
      };
      setExpressions(newExpressions);
      setStoreFacialExpressions(newExpressions);

      const newSkeletal = { 
        ...skeletalControls, 
        head: { x: -0.1, y: 0, z: 0 }, 
        neck: { x: 0.05, y: 0, z: 0 } 
      };
      setSkeletalControls(newSkeletal);
      setStoreSkeletalControls(newSkeletal);
    },
    happy: () => {
      const newExpressions = { 
        ...expressions, 
        smile: 0.8, 
        happy: 1, 
        mouthSmile: 0.6, 
        cheekSquint: 0.3 
      };
      setExpressions(newExpressions);
      setStoreFacialExpressions(newExpressions);
    },
    neutral: () => {
      const resetExpressions = {
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
      };
      setExpressions(resetExpressions);
      setStoreFacialExpressions(resetExpressions);

      const resetSkeletal = {
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
      };
      setSkeletalControls(resetSkeletal);
      setStoreSkeletalControls(resetSkeletal);
      setEyeGaze({ x: 0, y: 0 });
      setStoreEyeGaze({ x: 0, y: 0 });
    }
  };

  const ControlSlider = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
          {value.toFixed(2)}
        </span>
      </div>
      <Slider 
        value={[value]} 
        onValueChange={([val]) => onChange(val)} 
        min={min} 
        max={max} 
        step={step} 
        className="w-full" 
      />
    </div>
  );

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Avatar Controls
          {currentModel && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 ml-auto">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 h-full overflow-y-auto">
        <div className="px-6 pb-6">
          {/* Quick Presets */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Quick Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={presets.talking}
                className="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Talking
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={presets.singing}
                className="bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
              >
                <Music className="w-3 h-3 mr-1" />
                Singing
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={presets.happy}
                className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20"
              >
                <Smile className="w-3 h-3 mr-1" />
                Happy
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={presets.neutral}
                className="bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <Tabs defaultValue="gaze" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
              <TabsTrigger value="gaze" className="text-xs">Gaze</TabsTrigger>
              <TabsTrigger value="face" className="text-xs">Face</TabsTrigger>
              <TabsTrigger value="mouth" className="text-xs">Mouth</TabsTrigger>
              <TabsTrigger value="body" className="text-xs">Body</TabsTrigger>
            </TabsList>

            {/* Eye Gaze Control */}
            <TabsContent value="gaze" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  Eye Gaze Control
                </h3>
                
                {/* 2D Gaze Pad */}
                <div className="relative">
                  <div
                    ref={gazeRef}
                    className="w-full h-48 bg-slate-900/50 border-2 border-slate-600 rounded-lg cursor-crosshair relative overflow-hidden"
                    onMouseDown={(e) => {
                      setIsDragging(true);
                      handleGazeMove(e);
                    }}
                    onMouseMove={handleGazeMove}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-px bg-slate-600/50" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-px bg-slate-600/50" />
                    </div>
                    
                    {/* Center dot */}
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-slate-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                    
                    {/* Gaze indicator */}
                    <div 
                      className="absolute w-3 h-3 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 shadow-lg"
                      style={{
                        left: `${((eyeGaze.x + 1) / 2) * 100}%`,
                        top: `${((-eyeGaze.y + 1) / 2) * 100}%`
                      }}
                    />
                    
                    {/* Instructions */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="bg-slate-800/80 text-slate-300 border-slate-600 text-xs">
                        <MousePointer2 className="w-3 h-3 mr-1" />
                        Click & Drag
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Coordinate display */}
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>X: {eyeGaze.x.toFixed(2)}</span>
                    <span>Y: {eyeGaze.y.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Facial Expressions */}
            <TabsContent value="face" className="mt-6 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Smile className="w-4 h-4 text-purple-400" />
                Facial Expressions
              </h3>
              
              <div className="space-y-4">
                <ControlSlider
                  label="Smile"
                  value={expressions.smile}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, smile: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Frown"
                  value={expressions.frown}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, frown: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Surprised"
                  value={expressions.surprised}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, surprised: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Angry"
                  value={expressions.angry}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, angry: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Sad"
                  value={expressions.sad}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, sad: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Happy"
                  value={expressions.happy}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, happy: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Cheek Puff"
                  value={expressions.cheekPuff}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, cheekPuff: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Cheek Squint"
                  value={expressions.cheekSquint}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, cheekSquint: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
              </div>
            </TabsContent>

            {/* Mouth & Lip Controls */}
            <TabsContent value="mouth" className="mt-6 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-400" />
                Mouth & Lip Controls
              </h3>
              
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Mouth Shape</div>
                <ControlSlider
                  label="Mouth Open"
                  value={expressions.mouthOpen}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, mouthOpen: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Mouth Smile"
                  value={expressions.mouthSmile}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, mouthSmile: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Mouth Frown"
                  value={expressions.mouthFrown}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, mouthFrown: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Mouth Pucker"
                  value={expressions.mouthPucker}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, mouthPucker: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Mouth Funnel"
                  value={expressions.mouthFunnel}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, mouthFunnel: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Mouth Left"
                  value={expressions.mouthLeft}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, mouthLeft: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Mouth Right"
                  value={expressions.mouthRight}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, mouthRight: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                
                <div className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2 pt-4">Jaw Controls</div>
                <ControlSlider
                  label="Jaw Open"
                  value={expressions.jawOpen}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, jawOpen: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Jaw Forward"
                  value={expressions.jawForward}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, jawForward: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Jaw Left"
                  value={expressions.jawLeft}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, jawLeft: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Jaw Right"
                  value={expressions.jawRight}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, jawRight: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                
                <div className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2 pt-4">Advanced</div>
                <ControlSlider
                  label="Tongue Out"
                  value={expressions.tongueOut}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, tongueOut: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Upper Lip Roll"
                  value={expressions.lipRollUpper}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, lipRollUpper: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
                <ControlSlider
                  label="Lower Lip Roll"
                  value={expressions.lipRollLower}
                  onChange={(val) => {
                    const newExpressions = { ...expressions, lipRollLower: val };
                    setExpressions(newExpressions);
                    setStoreFacialExpressions(newExpressions);
                  }}
                />
              </div>
            </TabsContent>

            {/* Body Controls */}
            <TabsContent value="body" className="mt-6 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Move className="w-4 h-4 text-orange-400" />
                Body Controls
              </h3>
              
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Head Movement</div>
                <ControlSlider
                  label="Head Tilt X"
                  value={skeletalControls.headTilt.x}
                  onChange={(val) => {
                    const newSkeletal = {
                      ...skeletalControls,
                      headTilt: { ...skeletalControls.headTilt, x: val }
                    };
                    setSkeletalControls(newSkeletal);
                    setStoreSkeletalControls(newSkeletal);
                  }}
                  min={-0.5}
                  max={0.5}
                />
                <ControlSlider
                  label="Head Tilt Y"
                  value={skeletalControls.headTilt.y}
                  onChange={(val) => {
                    const newSkeletal = {
                      ...skeletalControls,
                      headTilt: { ...skeletalControls.headTilt, y: val }
                    };
                    setSkeletalControls(newSkeletal);
                    setStoreSkeletalControls(newSkeletal);
                  }}
                  min={-0.5}
                  max={0.5}
                />
                <ControlSlider
                  label="Head Nod"
                  value={skeletalControls.headNod.x}
                  onChange={(val) => {
                    const newSkeletal = {
                      ...skeletalControls,
                      headNod: { ...skeletalControls.headNod, x: val }
                    };
                    setSkeletalControls(newSkeletal);
                    setStoreSkeletalControls(newSkeletal);
                  }}
                  min={-0.3}
                  max={0.3}
                />
                <ControlSlider
                  label="Head Shake"
                  value={skeletalControls.headShake.y}
                  onChange={(val) => {
                    const newSkeletal = {
                      ...skeletalControls,
                      headShake: { ...skeletalControls.headShake, y: val }
                    };
                    setSkeletalControls(newSkeletal);
                    setStoreSkeletalControls(newSkeletal);
                  }}
                  min={-0.3}
                  max={0.3}
                />
                
                <div className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2 pt-4">Body Posture</div>
                <ControlSlider
                  label="Spine Rotation X"
                  value={skeletalControls.spine.x}
                  onChange={(val) => {
                    const newSkeletal = {
                      ...skeletalControls,
                      spine: { ...skeletalControls.spine, x: val }
                    };
                    setSkeletalControls(newSkeletal);
                    setStoreSkeletalControls(newSkeletal);
                  }}
                  min={-0.2}
                  max={0.2}
                />
                <ControlSlider
                  label="Left Shoulder"
                  value={skeletalControls.leftShoulder.z}
                  onChange={(val) => {
                    const newSkeletal = {
                      ...skeletalControls,
                      leftShoulder: { ...skeletalControls.leftShoulder, z: val }
                    };
                    setSkeletalControls(newSkeletal);
                    setStoreSkeletalControls(newSkeletal);
                  }}
                  min={-0.3}
                  max={0.3}
                />
                <ControlSlider
                  label="Right Shoulder"
                  value={skeletalControls.rightShoulder.z}
                  onChange={(val) => {
                    const newSkeletal = {
                      ...skeletalControls,
                      rightShoulder: { ...skeletalControls.rightShoulder, z: val }
                    };
                    setSkeletalControls(newSkeletal);
                    setStoreSkeletalControls(newSkeletal);
                  }}
                  min={-0.3}
                  max={0.3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
