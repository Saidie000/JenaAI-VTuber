import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Upload, FileText, Image, CheckCircle, AlertCircle, SkipForward, Download } from 'lucide-react';
import { useAvatarStore } from '../store/avatarStore.js';

export default function FileUpload({ onFileLoad, onLoadingChange, builtInModels, onBuiltInModelSelect, currentModelIndex }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);
  const { setModelUrl } = useAvatarStore();

  const handleFile = (file) => {
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    if (!fileNameLower.endsWith('.gltf') && !fileNameLower.endsWith('.glb')) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a valid .gltf or .glb file.'
      });
      return;
    }

    onLoadingChange(true);
    setUploadStatus({
      type: 'loading',
      message: `Loading ${file.name}...`
    });

    const url = URL.createObjectURL(file);
    setTimeout(() => {
      setModelUrl(url);
      onFileLoad(url, file.name);
      setUploadStatus({
        type: 'success',
        message: `${file.name} loaded successfully!`
      });
    }, 500);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Upload 3D Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer ${
            dragActive ? "border-blue-400 bg-blue-500/10" : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30"
          }`} 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".gltf,.glb" 
              onChange={handleFileInput} 
              className="hidden" 
            />

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                {dragActive ? (
                  <Download className="w-6 h-6 text-blue-400" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <h3 className="text-white font-semibold mb-2">
                {dragActive ? "Drop your file here" : "Drag & Drop GLTF/GLB"}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                or click to browse files
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  .gltf
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                  .glb
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
              uploadStatus.type === 'error' 
                ? 'bg-red-500/10 text-red-400' 
                : uploadStatus.type === 'success'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              {uploadStatus.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {uploadStatus.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
              {uploadStatus.type === 'loading' && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <span className="text-sm">{uploadStatus.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Built-in Models */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Image className="w-5 h-5 text-purple-400" />
            Built-in Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {builtInModels.map((model, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                index === currentModelIndex
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
              }`}
              onClick={() => onBuiltInModelSelect(index)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  index === currentModelIndex ? 'bg-blue-400' : 'bg-slate-500'
                }`} />
                <div>
                  <span className="text-white font-medium text-sm">{model.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 text-xs ${
                      model.type === 'character' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}
                  >
                    {model.type}
                  </Badge>
                </div>
              </div>
              {index === currentModelIndex && (
                <CheckCircle className="w-4 h-4 text-blue-400" />
              )}
            </div>
          ))}
          
          <Button 
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => onBuiltInModelSelect((currentModelIndex + 1) % builtInModels.length)}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Next Model
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
