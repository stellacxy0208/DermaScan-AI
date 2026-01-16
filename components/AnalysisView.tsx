import React from 'react';
import { AnalysisMode, AnalysisResult, VIEW_DEFINITIONS } from '../types';
import { Scan, RefreshCw, AlertCircle, Download, Maximize2 } from 'lucide-react';

interface AnalysisViewProps {
  mode: AnalysisMode;
  result: AnalysisResult | null;
  onReset: () => void;
  originalImage: string | null;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ mode, result, onReset, originalImage }) => {
  if (mode === AnalysisMode.ANALYZING) {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(#2dd4bf 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}></div>
        
        {/* Scanning Animation */}
        <div className="relative w-64 h-64 mb-8">
            {originalImage && (
                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-slate-700 opacity-50">
                    <img src={originalImage} alt="Scanning" className="w-full h-full object-cover grayscale opacity-50" />
                </div>
            )}
            <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-t-4 border-teal-400 rounded-full animate-spin"></div>
            <Scan className="absolute inset-0 m-auto text-teal-400 w-12 h-12 animate-ping" />
        </div>

        <h3 className="text-xl font-medium text-teal-400 mb-2">Analyzing Dermal Layers</h3>
        <p className="text-slate-400 text-sm animate-pulse">Processing spectral imaging data...</p>
        
        <div className="mt-8 flex space-x-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
        </div>
      </div>
    );
  }

  if (mode === AnalysisMode.ERROR) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
        <p className="text-red-600 mb-6 max-w-sm">
          We encountered an error processing your image. Please ensure you are using a clear, well-lit face photo and try again.
        </p>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (mode === AnalysisMode.COMPLETE && result) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Clinical Analysis Report</h2>
            <p className="text-xs text-slate-500">Generated on {new Date(result.timestamp).toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-2">
            <button 
                onClick={() => {
                    const link = document.createElement('a');
                    link.href = result.imageUrl;
                    link.download = 'dermascan-analysis.png';
                    link.click();
                }}
                className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" 
                title="Download Report"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
                onClick={onReset}
                className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="New Analysis"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Grid Display - 2x3 Aspect Ratio */}
        <div className="relative w-full bg-slate-900 group cursor-crosshair overflow-hidden aspect-[2/3]">
           <img 
             src={result.imageUrl} 
             alt="Skin Analysis Grid" 
             className="w-full h-full object-contain"
           />
           {/* Grid Overlay Guide (2x3 Layout) */}
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              
              {/* Row 1 */}
              <div className="absolute top-0 left-0 w-1/2 h-1/3 border-r border-b border-white/20 flex items-start justify-start p-2">
                 <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Brown Spots</span>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-1/3 border-b border-white/20 flex items-start justify-end p-2">
                 <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Red Areas</span>
              </div>

              {/* Row 2 */}
              <div className="absolute top-1/3 left-0 w-1/2 h-1/3 border-r border-b border-white/20 flex items-center justify-start p-2">
                 <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">UV Spots</span>
              </div>
              <div className="absolute top-1/3 right-0 w-1/2 h-1/3 border-b border-white/20 flex items-center justify-end p-2">
                 <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Wood's Light</span>
              </div>

              {/* Row 3 */}
              <div className="absolute bottom-0 left-0 w-1/2 h-1/3 border-r border-white/20 flex items-end justify-start p-2">
                 <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Wrinkles</span>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/3 flex items-end justify-end p-2">
                 <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Pores</span>
              </div>
              
              {/* Grid Lines */}
              {/* Vertical line */}
              <div className="absolute top-0 left-1/2 w-px h-full bg-white/20"></div>
              {/* Horizontal lines */}
              <div className="absolute top-1/3 left-0 w-full h-px bg-white/20"></div>
              <div className="absolute top-2/3 left-0 w-full h-px bg-white/20"></div>
           </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-200 border-t border-slate-200">
          {VIEW_DEFINITIONS.map((view) => (
            <div key={view.id} className="bg-white p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
              <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                view.id === 'brown' ? 'bg-amber-700' :
                view.id === 'red' ? 'bg-red-600' :
                view.id === 'uv' ? 'bg-slate-800' :
                view.id === 'wood' ? 'bg-violet-600' :
                view.id === 'wrinkles' ? 'bg-emerald-600' :
                'bg-fuchsia-600'
              }`}></div>
              <div>
                <h4 className={`text-sm font-bold ${view.color}`}>{view.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{view.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};