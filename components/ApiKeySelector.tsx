import React from 'react';
import { Key, Lock, ExternalLink, AlertCircle } from 'lucide-react';
import { openApiKeySelection } from '../services/geminiService';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
  error?: string | null;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected, error }) => {
  const handleSelectKey = async () => {
    try {
      await openApiKeySelection();
      // Assume success and proceed, as per race condition mitigation instructions
      onKeySelected();
    } catch (e) {
      console.error("Failed to select key", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">
              Authentication Required
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              DermaScan AI uses the professional-grade <strong>Gemini 3 Pro Image</strong> model for high-fidelity clinical imaging. This requires a paid API key from Google Cloud Project.
            </p>
          </div>

          {error && (
            <div className="w-full bg-red-50 border border-red-100 rounded-lg p-3 flex items-start space-x-3 text-left">
               <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
               <p className="text-sm text-red-700 leading-snug">{error}</p>
            </div>
          )}

          <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Paid API Key Needed</h3>
                <p className="text-xs text-blue-700 mt-1">
                  You will be prompted to select a Google Cloud Project with billing enabled.
                </p>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 font-medium mt-2 hover:underline"
                >
                  View Billing Documentation <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={handleSelectKey}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span>Connect Service</span>
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};