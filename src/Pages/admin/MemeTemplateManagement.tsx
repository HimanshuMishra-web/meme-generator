import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, ASSETS_URL } from '../../../constants';
import { useAuth } from '../../components/AuthContext';

interface MemeTemplate {
  _id: string;
  filename: string;
  originalName: string;
  title?: string; // Add optional title field
  thumbnail?: string; // Add optional thumbnail field for videos
  path: string;
  mediaType: string; // Add media type field (image, video, etc.)
  uploadedBy: string | { _id: string; username: string };
  createdAt: string;
  isPublic: boolean;
  url:string;
}

const MemeTemplateManagement: React.FC = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to check if file is a video
  const isVideoFile = (template: MemeTemplate) => {
    // Fallback to filename check for existing templates without mediaType
    if (template.mediaType) {
      return template.mediaType === 'video';
    }
    // Legacy check for existing templates
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    return videoExtensions.some(ext => template.filename.toLowerCase().endsWith(ext));
  };

  // Fetch meme templates
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['meme-templates'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/media/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Upload template mutation
  const uploadTemplateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meme-templates'] });
      setIsUploadModalOpen(false);
    },
    onError: () => {
      // Reset processing state on error
      const modal = document.querySelector('.upload-modal') as HTMLElement;
      if (modal) {
        const processingState = modal.querySelector('[data-processing="true"]');
        if (processingState) {
          processingState.setAttribute('data-processing', 'false');
        }
      }
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`${API_URL}/media/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meme-templates'] });
    },
  });

  // Update template status mutation (super admin only)
  const updateTemplateStatusMutation = useMutation({
    mutationFn: async ({ templateId, isPublic }: { templateId: string; isPublic: boolean }) => {
      const response = await fetch(`${API_URL}/media/templates/${templateId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic }),
      });
      if (!response.ok) throw new Error('Failed to update template status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meme-templates'] });
    },
  });

  const filteredTemplates = templates.filter((template: MemeTemplate) =>
    (template.title || template.originalName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = (formData: FormData) => {
    uploadTemplateMutation.mutate(formData);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleToggleTemplateStatus = (templateId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'make public' : 'make private';
    if (window.confirm(`Are you sure you want to ${action} this template?`)) {
      updateTemplateStatusMutation.mutate({ templateId, isPublic: newStatus });
    }
  };

  if (isLoading) return <div className="p-6">Loading templates...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading templates: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meme Template Management</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          Upload Template
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates by title or filename..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template: MemeTemplate) =>{
          return (
          <div key={template._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
              {isVideoFile(template) ? (
                <>
                  {template.thumbnail ? (
                    // Show thumbnail if available
                    <div className="relative w-full h-full">
                      <img
                        src={`${ASSETS_URL}${template.thumbnail}`}
                        alt={template.title || template.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to video element if thumbnail fails to load
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const videoElement = target.parentElement?.querySelector('.video-element') as HTMLVideoElement;
                          if (videoElement) videoElement.style.display = 'block';
                        }}
                      />
                      {/* Video play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all">
                        <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Fallback to video element if no thumbnail
                    <video
                      className="video-element w-full h-full object-cover"
                      src={`${ASSETS_URL}/media/${template.filename}`}
                      muted
                      onError={(e) => {
                        // Show fallback for video errors
                        const target = e.currentTarget as HTMLVideoElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.video-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  )}
                  <div className="video-fallback absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-500">Video</p>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={`${ASSETS_URL}${template.url}`}
                  alt={template.originalName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0IDg4LjU0NCA4MSA5OSA4MUgxMDFDMTExLjQ1NiA4MSAxMjAgODkuNTQ0IDEyMCAxMDBDMTIwIDExMC40NTYgMTExLjQ1NiAxMTkgMTAxIDExOUg5OUM4OC41NDQgMTE5IDgwIDExMC40NTYgODAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate" title={template.title || template.originalName}>
                {template.title || template.originalName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Uploaded by: {typeof template.uploadedBy === 'string' ? template.uploadedBy : template.uploadedBy?.username || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(template.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    template.isPublic ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {template.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    template.mediaType === 'video' ? 'bg-blue-100 text-blue-800' :
                    template.mediaType === 'image' ? 'bg-green-100 text-green-800' :
                    template.mediaType === 'audio' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(template.mediaType || 'unknown').charAt(0).toUpperCase() + (template.mediaType || 'unknown').slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {user?.role === 'super_admin' && (
                    <button
                      onClick={() => handleToggleTemplateStatus(template._id, template.isPublic)}
                      disabled={updateTemplateStatusMutation.isPending}
                      className={`text-xs px-2 py-1 rounded ${
                        template.isPublic 
                          ? 'text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100' 
                          : 'text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100'
                      } transition-colors`}
                      title={template.isPublic ? 'Make Private' : 'Make Public'}
                    >
                      {template.isPublic ? 'Private' : 'Public'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading a new meme template.
          </p>
        </div>
      )}

      {/* Upload Template Modal */}
      {isUploadModalOpen && (
        <UploadTemplateModal
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
          isLoading={uploadTemplateMutation.isPending}
        />
      )}
    </div>
  );
};

// Upload Template Modal Component
interface UploadTemplateModalProps {
  onClose: () => void;
  onUpload: (formData: FormData) => void;
  isLoading: boolean;
}

const UploadTemplateModal: React.FC<UploadTemplateModalProps> = ({ onClose, onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('isPublic', isPublic.toString());
    formData.append('type', 'template');
    formData.append('title', title);

    onUpload(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileDrop = (file: File) => {
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Upload Template</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter template title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Provide a descriptive title for the template
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <div
              className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-yellow-400 hover:bg-gray-50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files[0];
                if (file) {
                  handleFileDrop(file);
                }
              }}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">File selected successfully</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }
                      setSelectedFile(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop your file here, or{' '}
                    <label className="text-yellow-600 hover:text-yellow-700 cursor-pointer underline">
                      browse
                                              <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, MP4, MOV, AVI. Max size: 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {previewUrl && selectedFile.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : previewUrl && selectedFile.type.startsWith('video/') ? (
                  <div className="relative w-full h-full">
                    <video
                      src={previewUrl}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Video
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Preview not available</div>
                )}
              </div>
              {selectedFile.type.startsWith('video/') && (
                <p className="text-xs text-gray-500 mt-1">
                  A thumbnail will be automatically generated from this video
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-400"
              />
              <span className="ml-2 text-sm text-gray-700">Make template public</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isProcessing || !selectedFile}
              className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-full disabled:opacity-50 transition"
            >
              {isLoading || isProcessing ? (selectedFile?.type.startsWith('video/') ? 'Processing video...' : 'Uploading...') : 'Upload Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemeTemplateManagement; 