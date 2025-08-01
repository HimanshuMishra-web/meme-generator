import React, { useState, useEffect } from 'react';
import UserAvatar from '../components/UserAvatar';
import Tabs from '../components/Tabs';
import MemeCard from '../components/MemeCard';
import PageLayout from '../components/PageLayout';
import PremiumMemeDialog from '../components/PremiumMemeDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { useAuth } from '../components/AuthContext';
import { generateImageSource } from '../utils';
import toast from 'react-hot-toast';

const tabs = ['Created'];

interface Profile {
  _id: string;
  username: string;
  bio?: string;
  profileImage?: string;
  createdAt?: string;
  likesReceived?: number;
  isPublic?: boolean;
}

interface Meme {
  _id: string;
  url: string;
  prompt?: string;
  title?: string;
  is_public: boolean;
  likeCount?: number;
  reviewCount?: number;
  // Identify if it's a generated image or saved meme
  style?: string; // Only present in generated images
  modelUsed?: string; // Only present in generated images
  // Premium fields
  isPremium?: boolean;
  price?: number;
  soldCount?: number;
  totalEarnings?: number;
}

const UserProfilePage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Created');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<{ name: string; bio: string; avatar: File | null; isPublic: boolean }>({ name: '', bio: '', avatar: null, isPublic: false });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);

  // Fetch profile
  const { data: profile, isLoading: loadingProfile, error: errorProfile, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ['my-profile'],
    queryFn: async () => await apiService.get<Profile>('/users/me', token ?? undefined),
    enabled: !!token
  });

  // Sync form and avatarPreview with profile
  useEffect(() => {
    if (profile) {
      setForm(f => ({ ...f, name: profile.username || '', bio: profile.bio || '', isPublic: profile.isPublic || false }));
      setAvatarPreview(profile.profileImage ? generateImageSource('/assets/media/' + profile.profileImage) : '');
    }
  }, [profile]);

  // Fetch memes
  const { data: memesData, isLoading: loadingMemes, error: errorMemes, refetch: refetchMemes } = useQuery<{ memes: Meme[] }>({
    queryKey: ['my-memes'],
    queryFn: async () => await apiService.get<{ memes: Meme[] }>('/images/my-memes', token ?? undefined),
    enabled: !!token
  });
  const memes = memesData?.memes || [];

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => await apiService.put<Profile>('/users/me', formData, token ?? undefined, true),
    onSuccess: () => {
      setEditMode(false);
      refetchProfile();
    }
  });

  // Privacy update mutations
  const updatePrivacyMutation = useMutation({
    mutationFn: async ({ memeId, isPublic, isGenerated }: { memeId: string; isPublic: boolean; isGenerated: boolean }) => {
      const endpoint = isGenerated ? `/images/generated/${memeId}/privacy` : `/images/meme/${memeId}/privacy`;
      return await apiService.put(endpoint, { is_public: isPublic }, token ?? undefined);
    },
    onSuccess: (data, variables) => {
      toast.success(`Meme ${variables.isPublic ? 'made public' : 'made private'} successfully!`);
      refetchMemes();
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update privacy');
    }
  });

  // Handlers
  const handleEdit = () => {
    setEditMode(true);
    setForm({
      name: profile?.username || '',
      bio: profile?.bio || '',
      avatar: null,
      isPublic: profile?.isPublic || false
    });
    setAvatarPreview(profile && profile.profileImage ? generateImageSource('/assets/media/' + profile.profileImage) : '');
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: profile?.username || '',
      bio: profile?.bio || '',
      avatar: null,
      isPublic: profile?.isPublic || false
    });
    setAvatarPreview(profile && profile.profileImage ? generateImageSource('/assets/media/' + profile.profileImage) : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(f => ({ ...f, [name]: newValue }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, avatar: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setAvatarPreview(typeof ev.target?.result === 'string' ? ev.target.result : '');
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(profile && profile.profileImage ? generateImageSource('/assets/media/' + profile.profileImage) : '');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', form.name);
    formData.append('bio', form.bio);
    formData.append('isPublic', form.isPublic.toString());
    if (form.avatar) formData.append('profileImage', form.avatar);
    updateMutation.mutate(formData);
  };

  const handlePrivacyToggle = (meme: Meme) => {
    const isGenerated = !!(meme.style || meme.modelUsed); // Check if it's a generated image
    updatePrivacyMutation.mutate({
      memeId: meme._id,
      isPublic: !meme.is_public,
      isGenerated
    });
  };

  const handlePremiumToggle = (meme: Meme) => {
    setSelectedMeme(meme);
    setPremiumDialogOpen(true);
  };

  // Loading/error states
  if (loadingProfile) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-purple-600 font-medium">Loading your awesome profile...</p>
      </div>
    </div>
  );
  if (errorProfile) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">😔</div>
        <p className="text-red-600 font-medium">Failed to load profile. Please try again.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-cyan-300/20 rounded-full blur-3xl"></div>
      </div>
      
      <PageLayout className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
                     {/* Header Section with Profile Card */}
           <div className="relative mb-12">
             {/* Profile Info Card */}
             <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 pt-12 mx-4 md:mx-8">
               {/* Profile Avatar - Inside the card */}
               <div className="flex justify-center mb-6">
                 <div className="relative">
                   <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 p-1 shadow-xl">
                     <UserAvatar 
                       src={avatarPreview || ''} 
                       alt="Profile" 
                       size={120} 
                       className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                     />
                   </div>
                   {editMode && (
                     <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer group hover:bg-black/60 transition-colors">
                       <input
                         type="file"
                         accept="image/*"
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         onChange={handleAvatarChange}
                         title="Change avatar"
                       />
                       <div className="text-white text-center">
                         <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                         </svg>
                         <span className="text-xs font-medium">Change</span>
                       </div>
                     </div>
                   )}
                   
                   {/* Online Status Indicator */}
                   <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                     <div className="w-2 h-2 bg-white rounded-full"></div>
                   </div>
                 </div>
               </div>
              {editMode ? (
                <form className="text-center space-y-6" onSubmit={handleSave}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="text-3xl font-bold text-center bg-transparent border-b-2 border-purple-200 focus:border-purple-500 outline-none transition-colors px-4 py-2 w-full max-w-md mx-auto block"
                      placeholder="Your awesome username"
                      required
                    />
                    
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      className="text-gray-600 text-center bg-white/50 border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-3 w-full max-w-lg mx-auto resize-none outline-none transition-all"
                      rows={3}
                      placeholder="Tell the world something awesome about yourself..."
                    />
                    
                    <div className="flex items-center justify-center">
                      <label className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 rounded-full cursor-pointer hover:from-purple-100 hover:to-blue-100 transition-all group">
                        <input
                          type="checkbox"
                          name="isPublic"
                          checked={form.isPublic}
                          onChange={handleChange}
                          className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
                          🌐 Make profile public
                        </span>
                        <span className="text-sm text-gray-500">(Visible in community)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <button 
                      type="submit" 
                      disabled={updateMutation.status === 'pending'}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {updateMutation.status === 'pending' ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </span>
                      ) : (
                        '✨ Save Changes'
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      disabled={updateMutation.status === 'pending'}
                      className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {updateMutation.isError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                      Failed to update profile. Please try again.
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {profile?.username}
                    </h1>
                    
                    {profile?.isPublic && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        🌐 Public Profile
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    {profile?.bio || "✨ This user hasn't shared their story yet, but their memes speak volumes!"}
                  </p>
                  
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Joined {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 'recently'}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {profile?.likesReceived ?? 0} likes received
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleEdit}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 mt-6"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-8">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="max-w-md mx-auto"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Total Creations</p>
                  <p className="text-4xl font-black">{memes.length}</p>
                </div>
                <div className="text-5xl opacity-80">🖼️</div>
              </div>
              <div className="mt-4 bg-white/20 rounded-lg p-3">
                <p className="text-sm text-yellow-100">Your creative journey</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Public Memes</p>
                  <p className="text-4xl font-black">{memes.filter(m => m.is_public).length}</p>
                </div>
                <div className="text-5xl opacity-80">🌐</div>
              </div>
              <div className="mt-4 bg-white/20 rounded-lg p-3">
                <p className="text-sm text-green-100">Shared with community</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Likes Received</p>
                  <p className="text-4xl font-black">{profile?.likesReceived ?? 0}</p>
                </div>
                <div className="text-5xl opacity-80">👍</div>
              </div>
              <div className="mt-4 bg-white/20 rounded-lg p-3">
                <p className="text-sm text-purple-100">Community love</p>
              </div>
            </div>
          </div>

          {/* Memes Grid */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎨 Your Creative Collection
            </h2>
            
            {loadingMemes ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-purple-600 font-medium">Loading your masterpieces...</p>
                </div>
              </div>
            ) : errorMemes ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-red-600 font-medium">Failed to load memes. Please refresh the page.</p>
              </div>
            ) : memes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🎨</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Your canvas awaits!</h3>
                <p className="text-gray-500 text-lg mb-8">Start creating amazing memes to build your collection</p>
                <a 
                  href="/create" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  ✨ Create Your First Meme
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {memes.map((meme, index) => (
                  <div 
                    key={meme._id} 
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden rounded-t-2xl">
                      <MemeCard 
                        src={generateImageSource(meme.url)} 
                        title={meme.prompt || meme.title || ''} 
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* Controls Overlay */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Premium Badge */}
                        {meme.isPremium && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                              💎 ${meme.price}
                            </span>
                          </div>
                        )}
                        
                        {/* Current Status */}
                        <div className="flex items-center">
                          {meme.is_public ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                              🌐 Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white shadow-lg">
                              🔒 Private
                            </span>
                          )}
                        </div>
                        
                        {/* Control Buttons */}
                        <div className="flex flex-col gap-1">
                          {/* Privacy Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrivacyToggle(meme);
                            }}
                            disabled={updatePrivacyMutation.isPending}
                            className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                              meme.is_public 
                                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                            title={meme.is_public ? 'Make Private' : 'Make Public'}
                          >
                            {updatePrivacyMutation.isPending ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : meme.is_public ? (
                              <>🔒 Private</>
                            ) : (
                              <>🌐 Public</>
                            )}
                          </button>
                          
                          {/* Premium Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePremiumToggle(meme);
                            }}
                            className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                              meme.isPremium 
                                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            }`}
                            title={meme.isPremium ? 'Edit Premium' : 'Make Premium'}
                          >
                            {meme.isPremium ? <>💎 Edit</> : <>💎 Premium</>}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Meme Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 truncate text-sm">
                        {meme.prompt || meme.title || 'Untitled Masterpiece'}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {meme.style ? `AI Generated • ${meme.style}` : 'Custom Creation'}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          {meme.is_public && (
                            <>
                              <span className="text-red-500">❤️ {meme.likeCount || 0}</span>
                              <span className="text-blue-500">💬 {meme.reviewCount || 0}</span>
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            {meme.is_public ? (
                              <span className="text-xs text-green-600 font-medium">Public</span>
                            ) : (
                              <span className="text-xs text-gray-400">Private</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Premium Info */}
                      {meme.isPremium && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-yellow-600 font-medium">💎 Premium</span>
                            <span className="text-green-600 font-bold">${meme.price}</span>
                          </div>
                          {meme.soldCount && meme.soldCount > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Sold: {meme.soldCount} • Earnings: ${meme.totalEarnings?.toFixed(2) || '0.00'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageLayout>
      
      {/* Premium Meme Dialog */}
      {selectedMeme && (
        <PremiumMemeDialog
          isOpen={premiumDialogOpen}
          onClose={() => {
            setPremiumDialogOpen(false);
            setSelectedMeme(null);
          }}
          meme={{
            _id: selectedMeme._id,
            url: selectedMeme.url,
            title: selectedMeme.title,
            prompt: selectedMeme.prompt,
            isPremium: selectedMeme.isPremium,
            price: selectedMeme.price,
            memeType: selectedMeme.style ? 'GeneratedImage' : 'Meme'
          }}
        />
      )}
    </div>
  );
};

export default UserProfilePage; 