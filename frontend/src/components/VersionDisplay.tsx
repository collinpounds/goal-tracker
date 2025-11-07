import React, { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  commit: string;
  branch: string;
  timestamp: string;
  buildNumber: number;
}

function VersionDisplay() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Fetch version information
    fetch('/version.json')
      .then((res) => res.json())
      .then((data: VersionInfo) => setVersionInfo(data))
      .catch((err) => {
        console.error('Failed to fetch version info:', err);
        // Fallback version info for local development
        setVersionInfo({
          version: 'dev',
          commit: 'local',
          branch: 'development',
          timestamp: 'N/A',
          buildNumber: 0,
        });
      });
  }, []);

  if (!versionInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          title="Click for more details"
        >
          <span className="font-mono">{versionInfo.version}</span>
          <svg
            className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px]">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">
              Deployment Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-mono font-medium text-gray-900">{versionInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commit:</span>
                <span className="font-mono text-gray-900">{versionInfo.commit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Branch:</span>
                <span className="font-mono text-gray-900">{versionInfo.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build:</span>
                <span className="font-mono text-gray-900">#{versionInfo.buildNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deployed:</span>
                <span className="text-gray-900">{versionInfo.timestamp}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <button
                onClick={() => setShowDetails(false)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VersionDisplay;
