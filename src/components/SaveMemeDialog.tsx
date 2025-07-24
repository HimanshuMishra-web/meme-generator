import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface SaveMemeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveMemeData) => void;
  isLoading?: boolean;
}

export interface SaveMemeData {
  title: string;
  description: string;
  isPublic: boolean;
}

const SaveMemeDialog: React.FC<SaveMemeDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim().length > 100) {
      toast.error('Title must be 100 characters or less');
      return;
    }
    
    if (description.trim().length > 500) {
      toast.error('Description must be 500 characters or less');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      isPublic
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setDescription('');
      setIsPublic(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Save to Collection</h2>
          <p className="text-gray-600 mt-1">Add details to your meme before saving</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your meme a catchy title..."
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="text-xs text-gray-500 mt-1">
              {title.length}/100 characters
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your meme or add context..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Privacy Settings</h3>
            
            <div className="space-y-3">
              {/* Private option */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    🔒 Private
                  </div>
                  <div className="text-sm text-gray-600">
                    Only you can see this meme in your collection
                  </div>
                </div>
              </label>

              {/* Public option */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    🌐 Public
                  </div>
                  <div className="text-sm text-gray-600">
                    Others can see, like, and review this meme in the community
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save to Collection
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveMemeDialog; 