import React, { useState, useRef } from 'react';
import { XCircle, Key, Trash2 } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  onDelete: () => void;
  existingKey: boolean;
  isFirstRequest: boolean;
}

export default function APIKeyModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingKey,
  isFirstRequest,
}: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const nodeRef = useRef(null);
  const overlayRef = useRef(null);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to validate API key');
        return;
      }

      onSave(apiKey);
      onClose();
    } catch (err) {
      setError('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="modal"
      unmountOnExit
      appear
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="api-key-modal bg-slate-900/90 max-w-md w-full rounded-2xl p-6 relative border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <XCircle size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Key className="text-blue-400" size={24} />
          <h2 className="text-xl font-semibold text-white">
            {existingKey ? 'Manage API Key' : 'Add API Key'}
          </h2>
        </div>

        {isFirstRequest && !existingKey && (
          <div className="mb-6 p-4 border border-blue-500/20 rounded-lg bg-blue-500/20">
            <p className="text-sm text-blue-200">
              To use this resume builder, you'll need to add your Gemini API key first.
              Don't worry, this is a one-time setup!
            </p>
          </div>
        )}

        {!existingKey && (
          <div className="mb-6 space-y-4 text-sm text-gray-300">
            <p>To get your API key:</p>
            <ol className="list-decimal ml-4 space-y-2">
              <li>Visit the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></li>
              <li>Create or select a project</li>
              <li>Click on "Get API key"</li>
              <li>Copy and paste your API key below</li>
            </ol>
          </div>
        )}

        {!existingKey ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter your Gemini API key"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={isValidating}
                className="inline-flex items-center py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isValidating ? 'Validating...' : 'Save API Key'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Your API key is securely stored in your browser.
            </p>
            <div className="flex justify-center">
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Delete API Key
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </CSSTransition>
  );
}
