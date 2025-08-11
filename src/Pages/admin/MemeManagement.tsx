import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../../components/AuthContext';
import { apiService } from '../../services/axiosInstance';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Meme {
  _id: string;
  url: string;
  title?: string;
  description?: string;
  createdAt: string;
  is_public: boolean;
  publicationStatus: 'private' | 'pending' | 'approved' | 'rejected';
  memeType: 'Meme' | 'GeneratedImage';
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  likeCount?: number;
  reviewCount?: number;
  // Generated image specific fields
  prompt?: string;
  style?: string;
  modelUsed?: string;
  // Premium fields
  isPremium?: boolean;
  price?: number;
  soldCount?: number;
}

const MemeManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memeToDelete, setMemeToDelete] = useState<Meme | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);

  // Check if user is super admin - early return
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only super admins can access meme management.</p>
        </div>
      </div>
    );
  }

  // Fetch all memes - only run if user is super admin
  const { data: memes = [], isLoading, error } = useQuery({
    queryKey: ['admin-all-memes'],
    queryFn: async () => {
      const response = await apiService.get('/premium/admin/all-memes') as any;
      console.log('API Response memes:', response.memes?.map((m: any) => ({ id: m._id, url: m.url, type: m.memeType })));
      return response.memes || [];
    },
    enabled: !!user && user.role === 'super_admin', // Only run if user is super admin
  });

  // Toggle meme visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ memeId, memeType, isActive }: { memeId: string; memeType: string; isActive: boolean }) => {
      return await apiService.post('/premium/admin/toggle-meme-visibility', {
        memeId,
        memeType,
        isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-memes'] });
    },
  });

  // Handle delete confirmation
  const handleDeleteMeme = (meme: Meme) => {
    setMemeToDelete(meme);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMeme = () => {
    // TODO: Implement delete functionality if needed
    setShowDeleteDialog(false);
    setMemeToDelete(null);
  };

  const cancelDeleteMeme = () => {
    setShowDeleteDialog(false);
    setMemeToDelete(null);
  };

  // Handle toggle visibility
  const handleToggleVisibility = (meme: Meme) => {
    const isActive = !meme.is_public;
    toggleVisibilityMutation.mutate({
      memeId: meme._id,
      memeType: meme.memeType,
      isActive
    });
  };

  // Filter memes based on search term
  const filteredMemes = memes.filter((meme: Meme) =>
    (meme.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    meme.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meme.memeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'private':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GeneratedImage':
        return 'bg-purple-100 text-purple-800';
      case 'Meme':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to construct proper image URL
  const getImageUrl = (url: string) => {
    // If URL already starts with http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If URL already starts with /assets/, return as is
    if (url.startsWith('/assets/')) {
      return url;
    }
    
    // If URL starts with assets/ (without leading slash), add leading slash
    if (url.startsWith('assets/')) {
      return `/${url}`;
    }
    
    // For any other case, assume it needs /assets/ prefix
    return `/assets/${url}`;
  };

  // Placeholder image as data URL to avoid 404 errors
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAxMkMyMC42ODYzIDEyIDE4IDE0LjY4NjMgMTggMThDMTggMjEuMzEzNyAyMC42ODYzIDI0IDI0IDI0QzI3LjMxMzcgMjQgMzAgMjEuMzEzNyAzMCAxOEMzMCAxNC42ODYzIDI3LjMxMzcgMTIgMjQgMTJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMiAzNkMxMiAzMS41ODE3IDE1LjU4MTcgMjggMjAgMjhIMjhDMzIuNDE4MyAyOCAzNiAzMS41ODE3IDM2IDM2VjQwSDEyVjM2WiIgZmlsbD0iIzlCOUJBQyIvPgo8L3N2Zz4K';

  if (isLoading) return <div className="p-6">Loading memes...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading memes: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meme Management</h1>
        <p className="text-gray-600">Manage all user-created memes and AI-generated images</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, username, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{memes.length}</div>
          <div className="text-sm text-gray-600">Total Memes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {memes.filter((m: Meme) => m.is_public).length}
          </div>
          <div className="text-sm text-gray-600">Active Memes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {memes.filter((m: Meme) => m.memeType === 'GeneratedImage').length}
          </div>
          <div className="text-sm text-gray-600">AI Generated</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">
            {memes.filter((m: Meme) => m.isPremium).length}
          </div>
          <div className="text-sm text-gray-600">Premium Memes</div>
        </div>
      </div>

      {/* Memes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meme</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-sm">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMemes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-center text-gray-500 text-sm">
                    No memes found
                  </td>
                </tr>
              ) : (
                filteredMemes.map((meme: Meme) => (
                  <tr key={meme._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <img
                          src={getImageUrl(meme.url)}
                          alt={meme.title || 'Meme'}
                          className="w-12 h-12 object-cover rounded-lg mr-3"
                          onError={(e) => {
                            console.log('Image failed to load:', meme.url, 'Constructed URL:', getImageUrl(meme.url));
                            (e.target as HTMLImageElement).src = placeholderImage;
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {meme.title || 'Untitled'}
                          </div>
                          {meme.description && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {meme.description}
                            </div>
                          )}
                          {meme.isPremium && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              💎 Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm text-gray-900">{meme.user.username}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(meme.memeType)}`}>
                        {meme.memeType === 'GeneratedImage' ? 'AI Generated' : 'Image Meme'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(meme.publicationStatus)}`}>
                        {meme.publicationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {meme.likeCount || 0} likes
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {format(new Date(meme.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedMeme(meme);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-2 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(meme)}
                        disabled={toggleVisibilityMutation.isPending}
                        className={`p-1 rounded transition-colors ${
                          meme.is_public
                            ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={meme.is_public ? 'Deactivate' : 'Activate'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meme Details Modal */}
      {showDetails && selectedMeme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Meme Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={getImageUrl(selectedMeme.url)}
                  alt={selectedMeme.title || 'Meme'}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderImage;
                  }}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Title</h3>
                  <p className="text-gray-600">{selectedMeme.title || 'Untitled'}</p>
                </div>
                
                {selectedMeme.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600">{selectedMeme.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-gray-900">Creator</h3>
                  <p className="text-gray-600">{selectedMeme.user.username}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">Type</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedMeme.memeType)}`}>
                    {selectedMeme.memeType === 'GeneratedImage' ? 'AI Generated' : 'Image Meme'}
                  </span>
                </div>
                
                {selectedMeme.memeType === 'GeneratedImage' && selectedMeme.prompt && (
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Prompt</h3>
                    <p className="text-gray-600 text-sm">{selectedMeme.prompt}</p>
                  </div>
                )}
                
                {selectedMeme.memeType === 'GeneratedImage' && selectedMeme.style && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Style</h3>
                    <p className="text-gray-600">{selectedMeme.style}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-gray-900">Status</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMeme.publicationStatus)}`}>
                    {selectedMeme.publicationStatus.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">Created</h3>
                  <p className="text-gray-600">{format(new Date(selectedMeme.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">Stats</h3>
                  <p className="text-gray-600">
                    {selectedMeme.likeCount || 0} likes • {selectedMeme.reviewCount || 0} reviews
                    {selectedMeme.isPremium && ` • $${selectedMeme.price} • ${selectedMeme.soldCount || 0} sold`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Meme"
        description={`Are you sure you want to delete "${memeToDelete?.title || 'this meme'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMeme}
        onCancel={cancelDeleteMeme}
      />
    </div>
  );
};

export default MemeManagement;
