// GitOps Auditor v1.1.0 - Enhanced Diff Viewer Component
// Provides improved git diff visualization with syntax highlighting

import { useState } from 'react';

interface DiffViewerProps {
  diffContent: string;
  repoName: string;
  onClose: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diffContent, repoName, onClose }) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  // Parse diff content into structured format
  const parseDiff = (content: string) => {
    const lines = content.split('\n');
    const files: Array<{
      oldPath: string;
      newPath: string;
      hunks: Array<{
        oldStart: number;
        oldCount: number;
        newStart: number;
        newCount: number;
        lines: Array<{
          type: 'add' | 'remove' | 'context' | 'header';
          content: string;
          oldLineNum?: number;
          newLineNum?: number;
        }>;
      }>;
    }> = [];

    let currentFile: typeof files[0] | null = null;
    let currentHunk: typeof files[0]['hunks'][0] | null = null;
    let oldLineNum = 0;
    let newLineNum = 0;

    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        // New file
        if (currentFile) files.push(currentFile);
        currentFile = {
          oldPath: '',
          newPath: '',
          hunks: []
        };
      } else if (line.startsWith('--- ')) {
        if (currentFile) {
          currentFile.oldPath = line.substring(4);
        }
      } else if (line.startsWith('+++ ')) {
        if (currentFile) {
          currentFile.newPath = line.substring(4);
        }
      } else if (line.startsWith('@@')) {
        // New hunk
        const match = line.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
        if (match && currentFile) {
          currentHunk = {
            oldStart: parseInt(match[1]),
            oldCount: parseInt(match[2]),
            newStart: parseInt(match[3]),
            newCount: parseInt(match[4]),
            lines: []
          };
          currentFile.hunks.push(currentHunk);
          oldLineNum = parseInt(match[1]);
          newLineNum = parseInt(match[3]);
        }
      } else if (currentHunk) {
        // Diff line
        if (line.startsWith('+')) {
          currentHunk.lines.push({
            type: 'add',
            content: line.substring(1),
            newLineNum: newLineNum++
          });
        } else if (line.startsWith('-')) {
          currentHunk.lines.push({
            type: 'remove',
            content: line.substring(1),
            oldLineNum: oldLineNum++
          });
        } else if (line.startsWith(' ')) {
          currentHunk.lines.push({
            type: 'context',
            content: line.substring(1),
            oldLineNum: oldLineNum++,
            newLineNum: newLineNum++
          });
        }
      }
    }

    if (currentFile) files.push(currentFile);
    return files;
  };

  const diffFiles = parseDiff(diffContent);

  const getLineTypeClass = (type: string) => {
    switch (type) {
      case 'add':
        return 'bg-green-50 border-l-4 border-green-400 text-green-800';
      case 'remove':
        return 'bg-red-50 border-l-4 border-red-400 text-red-800';
      case 'context':
        return 'bg-gray-50';
      default:
        return '';
    }
  };

  const renderUnifiedView = () => (
    <div className="space-y-6">
      {diffFiles.map((file, fileIndex) => (
        <div key={fileIndex} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {file.oldPath} → {file.newPath}
              </span>
              <span className="text-xs text-gray-500">
                {file.hunks.length} hunk{file.hunks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {file.hunks.map((hunk, hunkIndex) => (
            <div key={hunkIndex} className="border-b last:border-b-0">
              <div className="bg-blue-50 px-4 py-1 text-xs text-blue-700 font-mono">
                @@ -{hunk.oldStart},{hunk.oldCount} +{hunk.newStart},{hunk.newCount} @@
              </div>
              
              {hunk.lines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={`flex font-mono text-sm ${getLineTypeClass(line.type)}`}
                >
                  {showLineNumbers && (
                    <div className="flex">
                      <span className="w-12 px-2 py-1 text-gray-400 text-right">
                        {line.oldLineNum || ''}
                      </span>
                      <span className="w-12 px-2 py-1 text-gray-400 text-right">
                        {line.newLineNum || ''}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 px-4 py-1 whitespace-pre-wrap">
                    {line.type === 'add' && <span className="text-green-600 mr-2">+</span>}
                    {line.type === 'remove' && <span className="text-red-600 mr-2">-</span>}
                    {line.type === 'context' && <span className="text-gray-400 mr-2"> </span>}
                    {line.content}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderSplitView = () => (
    <div className="space-y-6">
      {diffFiles.map((file, fileIndex) => (
        <div key={fileIndex} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <span className="font-mono text-sm">
              {file.oldPath} → {file.newPath}
            </span>
          </div>
          
          {file.hunks.map((hunk, hunkIndex) => (
            <div key={hunkIndex} className="border-b last:border-b-0">
              <div className="bg-blue-50 px-4 py-1 text-xs text-blue-700 font-mono">
                @@ -{hunk.oldStart},{hunk.oldCount} +{hunk.newStart},{hunk.newCount} @@
              </div>
              
              <div className="grid grid-cols-2">
                {/* Old version */}
                <div className="border-r">
                  <div className="bg-red-100 px-4 py-1 text-xs font-semibold text-red-700">
                    Original
                  </div>
                  {hunk.lines.filter(l => l.type !== 'add').map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      className={`flex font-mono text-sm ${
                        line.type === 'remove' ? 'bg-red-50' : 'bg-gray-50'
                      }`}
                    >
                      {showLineNumbers && (
                        <span className="w-12 px-2 py-1 text-gray-400 text-right">
                          {line.oldLineNum || ''}
                        </span>
                      )}
                      <div className="flex-1 px-4 py-1 whitespace-pre-wrap">
                        {line.type === 'remove' && <span className="text-red-600 mr-2">-</span>}
                        {line.content}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* New version */}
                <div>
                  <div className="bg-green-100 px-4 py-1 text-xs font-semibold text-green-700">
                    Modified
                  </div>
                  {hunk.lines.filter(l => l.type !== 'remove').map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      className={`flex font-mono text-sm ${
                        line.type === 'add' ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      {showLineNumbers && (
                        <span className="w-12 px-2 py-1 text-gray-400 text-right">
                          {line.newLineNum || ''}
                        </span>
                      )}
                      <div className="flex-1 px-4 py-1 whitespace-pre-wrap">
                        {line.type === 'add' && <span className="text-green-600 mr-2">+</span>}
                        {line.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  if (!diffContent || diffContent.trim() === '') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-4">No Changes Found</h3>
          <p className="text-gray-600 mb-4">
            No uncommitted changes were found in this repository.
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Git Diff: {repoName}</h3>
            <p className="text-sm text-gray-600">{diffFiles.length} file(s) changed</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View mode toggle */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">View:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'unified' | 'split')}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="unified">Unified</option>
                <option value="split">Split</option>
              </select>
            </div>
            
            {/* Line numbers toggle */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded"
              />
              <span>Line Numbers</span>
            </label>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'unified' ? renderUnifiedView() : renderSplitView()}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
