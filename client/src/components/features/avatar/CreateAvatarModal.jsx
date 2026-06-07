import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Save, RefreshCw } from 'lucide-react';
import { useStore } from '../../../store/useStore';

const CreateAvatarModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('selection'); // 'selection', 'upload', 'scan'
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  
  const addCustomAvatar = useStore((state) => state.addCustomAvatar);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartScan = () => {
    setMode('scan');
    setIsScanning(true);
    // Simulate a scan delay
    setTimeout(() => {
      setIsScanning(false);
      // Mocking a successful scan with a placeholder face for now
      setPreview('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80');
      setMode('preview');
    }, 2500);
  };

  const handleSave = () => {
    if (!preview || !name.trim()) return;

    const newAvatar = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      imageUrl: preview,
      isCustom: true
    };

    addCustomAvatar(newAvatar);
    handleClose();
  };

  const handleClose = () => {
    setMode('selection');
    setPreview(null);
    setName('');
    setIsScanning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">Create Custom Avatar</h2>
          <button 
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {mode === 'selection' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-6">
                Create a realistic avatar of yourself or anyone else to be used in your videos.
              </p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all p-6 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Upload Image</h3>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </button>

              <button 
                onClick={handleStartScan}
                className="w-full group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all p-6 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Face Scan</h3>
                  <p className="text-xs text-gray-500 mt-1">Use your camera for a 3D scan</p>
                </div>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {mode === 'scan' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-purple-500/50 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-1">Scanning Face...</h3>
                <p className="text-sm text-gray-400">Please look straight into the camera.</p>
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div className="space-y-6">
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white/10 shadow-lg">
                <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Avatar Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Professional Avatar"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setMode('selection')}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                >
                  Retake
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Avatar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAvatarModal;
