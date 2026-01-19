import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, FileImage, ShieldCheck, Info } from 'lucide-react';
import { ApiKeySelector } from './components/ApiKeySelector';
import { AnalysisView } from './components/AnalysisView';
import { checkApiKey, generateSkinAnalysis } from './services/geminiService';
import { AnalysisMode, AnalysisResult } from './types';

function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const verifyKey = async () => {
      try {
        const hasKey = await checkApiKey();
        setHasApiKey(hasKey);
      } catch (e) {
        console.error("Key check failed", e);
        setHasApiKey(false);
      } finally {
        setCheckingKey(false);
      }
    };
    verifyKey();
  }, []);

  const handleKeySelected = () => {
    setHasApiKey(true);
    setAuthError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMode(AnalysisMode.IDLE);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setMode(AnalysisMode.ANALYZING);
    try {
      const generatedImageUrl = await generateSkinAnalysis(selectedImage);
      setResult({
        imageUrl: generatedImageUrl,
        timestamp: Date.now()
      });
      setMode(AnalysisMode.COMPLETE);
    } catch (error: any) {
      console.error("Analysis Error:", error);

      // Check for Permission Denied (403) or "Requested entity was not found" errors
      // This indicates the key is invalid, missing billing, or project doesn't have access.
      const errorMessage = error.message || error.toString();
      const isAuthError = 
        errorMessage.includes("403") || 
        errorMessage.includes("PERMISSION_DENIED") ||
        errorMessage.includes("caller does not have permission");

      if (isAuthError) {
        setAuthError("Permission Denied: Please select a valid paid API Key. Your previous key may lack billing or permissions.");
        setHasApiKey(false); // Reset to force key re-selection
        setMode(AnalysisMode.IDLE);
        return;
      }

      setMode(AnalysisMode.ERROR);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResult(null);
    setMode(AnalysisMode.IDLE);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  if (checkingKey) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>;
  }

  if (!hasApiKey) {
    return <ApiKeySelector onKeySelected={handleKeySelected} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 p-2 rounded-lg">
                <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
              DermaScan AI
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
              PRO SYSTEM
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
             <span className="hidden md:inline">Powered by Gemini Pro Vision</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-teal-600" />
                Input Source
              </h2>
              
              {!selectedImage ? (
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all group h-64"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors shadow-sm">
                    <Upload className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">Upload Client Photo</h3>
                  <p className="text-slate-500 text-sm mb-4">JPEG, PNG or WEBP (Max 5MB)</p>
                  <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Select File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[3/4] shadow-inner">
                    <img 
                      src={selectedImage} 
                      alt="Client" 
                      className="w-full h-full object-cover"
                    />
                    {mode === AnalysisMode.ANALYZING && (
                        <div className="scan-line"></div>
                    )}
                  </div>
                  <div className="flex space-x-3">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        disabled={mode === AnalysisMode.ANALYZING}
                      >
                        Change Photo
                      </button>
                  </div>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {selectedImage && mode === AnalysisMode.IDLE && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                   <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-teal-900">Ready for Analysis</h4>
                        <p className="text-xs text-teal-700 mt-1">
                           System will generate 6 distinct clinical views including Wrinkles and Pore analysis.
                        </p>
                      </div>
                   </div>
                   <button 
                    onClick={handleAnalyze}
                    className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]"
                   >
                     Start Clinical Analysis
                   </button>
                </div>
            )}
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8">
            {mode === AnalysisMode.IDLE && !selectedImage ? (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <FileImage className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Image Selected</p>
                    <p className="text-sm">Upload a face photo to begin analysis</p>
                </div>
            ) : (
                <AnalysisView 
                    mode={mode} 
                    result={result} 
                    onReset={resetAnalysis} 
                    originalImage={selectedImage}
                />
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;