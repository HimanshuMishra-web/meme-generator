import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { apiService } from '../../services/axiosInstance';
import { generateImageSource } from '../../utils';
import { toast } from 'react-hot-toast';

interface PendingMeme {
  _id: string;
  url: string;
  title?: string;
  description?: string;
  user?: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  memeType: 'Meme' | 'GeneratedImage';
  createdAt: string;
  publicationStatus: 'pending' | 'approved' | 'rejected';
}

interface ReviewStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
}

interface AllMeme {
  _id: string;
  url: string;
  title?: string;
  description?: string;
  user?: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  memeType: 'Meme' | 'GeneratedImage';
  createdAt: string;
  publicationStatus: 'private' | 'pending' | 'approved' | 'rejected';
  is_public: boolean;
  rejectionReason?: string;
}

const REJECTION_TEMPLATES = [
  {
    id: 'inappropriate',
    label: 'Inappropriate Content',
    message: 'This meme contains inappropriate content that violates our community guidelines.'
  },
  {
    id: 'offensive',
    label: 'Offensive Language',
    message: 'This meme contains offensive language or hate speech that is not allowed on our platform.'
  },
  {
    id: 'copyright',
    label: 'Copyright Violation',
    message: 'This meme appears to violate copyright laws or contains unauthorized use of protected content.'
  },
  {
    id: 'spam',
    label: 'Spam or Low Quality',
    message: 'This meme appears to be spam or low-quality content that doesn\'t meet our standards.'
  },
  {
    id: 'political',
    label: 'Political Content',
    message: 'This meme contains political content that may be divisive or inappropriate for our platform.'
  },
  {
    id: 'nsfw',
    label: 'NSFW Content',
    message: 'This meme contains content that is not suitable for work or general audiences.'
  },
  {
    id: 'custom',
    label: 'Custom Reason',
    message: ''
  }
];

const MemeReviewManagement: React.FC = () => {
  const { user } = useAuth();
  const [pendingMemes, setPendingMemes] = useState<PendingMeme[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('inappropriate');
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [allMemes, setAllMemes] = useState<AllMeme[]>([]);
  const [loadingAllMemes, setLoadingAllMemes] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchPendingMemes();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllMemes();
    }
  }, [activeTab]);

  const fetchPendingMemes = async () => {
    try {
      const response = await apiService.get('/premium/admin/pending');
      setPendingMemes(response.memes);
    } catch (error) {
      console.error('Error fetching pending memes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/premium/admin/stats');
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAllMemes = async () => {
    setLoadingAllMemes(true);
    try {
      const response = await apiService.get('/premium/admin/all-memes');
      setAllMemes(response.memes);
    } catch (error) {
      console.error('Error fetching all memes:', error);
      toast.error('Failed to fetch all memes');
    } finally {
      setLoadingAllMemes(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = REJECTION_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setRejectionReason(template.message);
    }
  };

  const handleReview = async (memeId: string, memeType: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setReviewing(memeId);
    try {
      const payload = {
        memeId,
        memeType,
        action,
        ...(action === 'reject' && { rejectionReason: rejectionReason.trim() })
      };

      await apiService.post('/premium/admin/review', payload);
      
      // Remove the meme from the list
      setPendingMemes(prev => prev.filter(meme => meme._id !== memeId));
      
      // Refresh stats
      fetchStats();
      
      // Reset rejection reason
      setRejectionReason('');
      setShowRejectDialog(null);
      
             toast.success(`Meme ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
     } catch (error) {
       console.error('Error reviewing meme:', error);
       toast.error('Failed to review meme');
     } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading pending memes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meme Review Management</h1>
        <button
          onClick={() => { fetchPendingMemes(); fetchStats(); }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Refresh
        </button>
      </div>

             {/* Statistics */}
       {stats && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
             <h3 className="text-lg font-semibold text-yellow-800">Pending Review</h3>
             <p className="text-2xl font-bold text-yellow-900">{stats.totalPending}</p>
           </div>
           <div className="bg-green-100 border border-green-300 rounded-lg p-4">
             <h3 className="text-lg font-semibold text-green-800">Approved</h3>
             <p className="text-2xl font-bold text-green-900">{stats.totalApproved}</p>
           </div>
           <div className="bg-red-100 border border-red-300 rounded-lg p-4">
             <h3 className="text-lg font-semibold text-red-800">Rejected</h3>
             <p className="text-2xl font-bold text-red-900">{stats.totalRejected}</p>
           </div>
         </div>
       )}

       {/* Tab Navigation */}
       <div className="mb-6">
         <div className="border-b border-gray-200">
           <nav className="-mb-px flex space-x-8">
             <button
               onClick={() => setActiveTab('pending')}
               className={`py-2 px-1 border-b-2 font-medium text-sm ${
                 activeTab === 'pending'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               Pending Review ({pendingMemes.length})
             </button>
             <button
               onClick={() => setActiveTab('all')}
               className={`py-2 px-1 border-b-2 font-medium text-sm ${
                 activeTab === 'all'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               All Memes ({allMemes.length})
             </button>
           </nav>
         </div>
       </div>

       {/* Content based on active tab */}
       {activeTab === 'pending' ? (
         <div className="space-y-4">
           <h2 className="text-xl font-semibold text-gray-800">Pending Review ({pendingMemes.length})</h2>
        
        {pendingMemes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No memes pending review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingMemes.map((meme) => (
              <div key={meme._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="relative">
                  <img 
                    src={generateImageSource(meme.url)} 
                    alt={meme.title || 'Meme'} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      meme.memeType === 'GeneratedImage' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {meme.memeType}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                                       <div className="flex items-center mb-3">
                       <img 
                         src={meme.user?.profileImage ? generateImageSource('/assets/media/' + meme.user.profileImage) : '/default-avatar.png'} 
                         alt={meme.user?.username || 'Unknown User'}
                         className="w-8 h-8 rounded-full mr-2"
                       />
                       <span className="font-medium text-gray-800">{meme.user?.username || 'Unknown User'}</span>
                     </div>
                  
                  {meme.title && (
                    <h3 className="font-semibold text-gray-900 mb-1">{meme.title}</h3>
                  )}
                  
                  {meme.description && (
                    <p className="text-gray-600 text-sm mb-3">{meme.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Submitted: {new Date(meme.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReview(meme._id, meme.memeType, 'approve')}
                      disabled={reviewing === meme._id}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm font-medium transition"
                    >
                      {reviewing === meme._id ? 'Processing...' : 'Approve'}
                    </button>
                    
                    <button
                      onClick={() => setShowRejectDialog(meme._id)}
                      disabled={reviewing === meme._id}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm font-medium transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
       ) : (
         <div className="space-y-4">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold text-gray-800">All Memes ({allMemes.length})</h2>
             <button
               onClick={fetchAllMemes}
               disabled={loadingAllMemes}
               className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition"
             >
               {loadingAllMemes ? 'Loading...' : 'Refresh'}
             </button>
           </div>
           
           {loadingAllMemes ? (
             <div className="text-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p className="text-gray-500">Loading all memes...</p>
             </div>
           ) : allMemes.length === 0 ? (
             <div className="text-center py-8">
               <p className="text-gray-500 text-lg">No memes found</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {allMemes.map((meme) => (
                 <div key={meme._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                   <div className="relative">
                     <img 
                       src={generateImageSource(meme.url)} 
                       alt={meme.title || 'Meme'} 
                       className="w-full h-48 object-cover"
                     />
                     <div className="absolute top-2 left-2 flex flex-col gap-1">
                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                         meme.memeType === 'GeneratedImage' 
                           ? 'bg-purple-100 text-purple-800' 
                           : 'bg-blue-100 text-blue-800'
                       }`}>
                         {meme.memeType}
                       </span>
                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                         meme.publicationStatus === 'approved' 
                           ? 'bg-green-100 text-green-800'
                           : meme.publicationStatus === 'rejected'
                           ? 'bg-red-100 text-red-800'
                           : meme.publicationStatus === 'pending'
                           ? 'bg-yellow-100 text-yellow-800'
                           : 'bg-gray-100 text-gray-800'
                       }`}>
                         {meme.publicationStatus.charAt(0).toUpperCase() + meme.publicationStatus.slice(1)}
                       </span>
                     </div>
                   </div>
                   
                   <div className="p-4">
                     <div className="flex items-center mb-3">
                       <img 
                         src={meme.user?.profileImage ? generateImageSource('/assets/media/' + meme.user.profileImage) : '/default-avatar.png'} 
                         alt={meme.user?.username || 'Unknown User'}
                         className="w-8 h-8 rounded-full mr-2"
                       />
                       <span className="font-medium text-gray-800">{meme.user?.username || 'Unknown User'}</span>
                     </div>
                     
                     {meme.title && (
                       <h3 className="font-semibold text-gray-900 mb-1">{meme.title}</h3>
                     )}
                     
                     {meme.description && (
                       <p className="text-gray-600 text-sm mb-3">{meme.description}</p>
                     )}
                     
                     <div className="text-xs text-gray-500 mb-2">
                       Created: {new Date(meme.createdAt).toLocaleDateString()}
                     </div>
                     
                     {meme.rejectionReason && (
                       <div className="text-xs text-red-600 mb-2">
                         <strong>Rejection Reason:</strong> {meme.rejectionReason}
                       </div>
                     )}
                     
                     <div className="text-xs text-gray-500">
                       Public: {meme.is_public ? 'Yes' : 'No'}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       )}

       {/* Rejection Dialog */}
       {showRejectDialog && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Meme</h3>
             <p className="text-gray-600 mb-4">Please provide a reason for rejecting this meme:</p>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Template Selection */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates:</label>
                 <div className="space-y-2 max-h-64 overflow-y-auto">
                   {REJECTION_TEMPLATES.map((template) => (
                     <button
                       key={template.id}
                       onClick={() => handleTemplateChange(template.id)}
                       className={`w-full text-left p-3 rounded-lg border transition ${
                         selectedTemplate === template.id
                           ? 'border-blue-500 bg-blue-50 text-blue-700'
                           : 'border-gray-200 bg-white hover:bg-gray-50'
                       }`}
                     >
                       <div className="font-medium text-sm">{template.label}</div>
                       {template.message && (
                         <div className="text-xs text-gray-600 mt-1">
                           {template.message}
                         </div>
                       )}
                     </button>
                   ))}
                 </div>
               </div>
               
               {/* Textarea */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason:</label>
                 <textarea
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   placeholder="Enter rejection reason..."
                   className="w-full p-3 border border-gray-300 rounded-lg resize-none h-64"
                   rows={12}
                 />
               </div>
             </div>
            
            <div className="flex space-x-3">
                             <button
                 onClick={() => {
                   setShowRejectDialog(null);
                   setRejectionReason('');
                   setSelectedTemplate('inappropriate');
                 }}
                 className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
               >
                Cancel
              </button>
              
                             <button
                 onClick={() => {
                   const meme = pendingMemes.find(m => m._id === showRejectDialog);
                   handleReview(showRejectDialog, meme?.memeType || 'Meme', 'reject');
                 }}
                 disabled={!rejectionReason.trim()}
                 className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition"
               >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeReviewManagement; 