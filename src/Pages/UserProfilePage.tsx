import React, { useState, useEffect } from 'react';
import UserAvatar from '../components/UserAvatar';
import Tabs from '../components/Tabs';
import MemeCard from '../components/MemeCard';
import PageLayout from '../components/PageLayout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { useAuth } from '../components/AuthContext';
import { generateImageSource } from '../utils';

const tabs = ['Created'];

interface Profile {
  _id: string;
  username: string;
  bio?: string;
  profileImage?: string;
  createdAt?: string;
  likesReceived?: number;
}

interface Meme {
  _id: string;
  url: string;
  prompt?: string;
  title?: string;
}

const UserProfilePage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('Created');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatar: null as File | null });
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Fetch profile
  const { data: profile, isLoading: loadingProfile, error: errorProfile, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ['my-profile'],
    queryFn: async () => await apiService.get<Profile>('/users/me', token),
    enabled: !!token
  });

  // Sync form and avatarPreview with profile
  useEffect(() => {
    if (profile) {
      setForm(f => ({ ...f, name: profile.username || '', bio: profile.bio || '' }));
      setAvatarPreview(profile.profileImage ? generateImageSource('/assets/media/' + profile.profileImage) : '');
    }
  }, [profile]);

  // Fetch memes
  const { data: memesData, isLoading: loadingMemes, error: errorMemes } = useQuery<{ memes: Meme[] }>({
    queryKey: ['my-memes'],
    queryFn: async () => await apiService.get<{ memes: Meme[] }>('/images/my-memes', token),
    enabled: !!token
  });
  const memes = memesData?.memes || [];

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => await apiService.put<Profile>('/users/me', formData, token, true),
    onSuccess: () => {
      setEditMode(false);
      refetchProfile();
    }
  });

  // Handlers
  const handleEdit = () => {
    setEditMode(true);
    setForm({
      name: profile?.username || '',
      bio: profile?.bio || '',
      avatar: null
    });
    setAvatarPreview(profile && profile.profileImage ? generateImageSource('/assets/media/' + profile.profileImage) : '');
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: profile?.username || '',
      bio: profile?.bio || '',
      avatar: null
    });
    setAvatarPreview(profile && profile.profileImage ? generateImageSource('/assets/media/' + profile.profileImage) : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
    if (form.avatar) formData.append('profileImage', form.avatar);
    updateMutation.mutate(formData);
  };

  // Loading/error states
  if (loadingProfile) return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  if (errorProfile) return <div className="flex justify-center items-center min-h-screen text-red-500">Failed to load profile.</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      <PageLayout className="flex flex-col items-center">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6 w-full">
          <div className="relative mb-4">
            <UserAvatar src={avatarPreview || ''} alt="Profile" size={128} className="mb-2" />
            {editMode && (
              <input
                type="file"
                accept="image/*"
                className="absolute left-0 right-0 bottom-0 mx-auto opacity-0 w-full h-full cursor-pointer"
                style={{ height: 128 }}
                onChange={handleAvatarChange}
                title="Change avatar"
              />
            )}
          </div>
          {editMode ? (
            <form className="flex flex-col items-center w-full" onSubmit={handleSave}>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="text-2xl font-bold mb-1 text-center border-b border-gray-300 focus:outline-none focus:border-blue-400 bg-gray-50 px-2 py-1 w-64"
                required
              />
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="text-gray-600 mb-1 text-center border-b border-gray-300 focus:outline-none focus:border-blue-400 bg-gray-50 px-2 py-1 w-full max-w-md resize-y"
                rows={2}
                placeholder="Add a short bio"
              />
              <div className="flex gap-3 mt-3">
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded font-semibold hover:bg-blue-600 transition disabled:opacity-60" disabled={updateMutation.status === 'pending'}>Save</button>
                <button type="button" className="bg-gray-200 px-6 py-2 rounded font-semibold text-gray-700 hover:bg-gray-300 transition" onClick={handleCancel} disabled={updateMutation.status === 'pending'}>Cancel</button>
              </div>
              {updateMutation.isError && <div className="text-red-500 mt-2">Failed to update profile.</div>}
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-1">{profile?.username}</h2>
              <p className="text-gray-600 mb-1 text-center">{profile?.bio || 'No bio yet.'}</p>
              <p className="text-gray-400 text-sm mb-3">Joined {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : ''}</p>
              <button className="bg-gray-100 px-6 py-2 rounded font-semibold text-gray-700 hover:bg-gray-200 transition" onClick={handleEdit}>Edit Profile</button>
            </>
          )}
        </div>
        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6 border-b w-full max-w-4xl justify-center" />
        {/* Meme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
          {loadingMemes ? (
            <div className="col-span-full text-center">Loading memes...</div>
          ) : errorMemes ? (
            <div className="col-span-full text-red-500 text-center">Failed to load memes.</div>
          ) : memes.length === 0 ? (
            <div className="col-span-full text-gray-400 text-center">No memes created yet.</div>
          ) : (
            memes.map((meme) => (
              <MemeCard key={meme._id} src={generateImageSource(meme.url)} title={meme.prompt || meme.title || ''} />
            ))
          )}
        </div>
        {/* Stats */}
        <div className="flex space-x-8 w-full max-w-2xl justify-center">
          <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col items-center">
            <span className="text-2xl font-bold">{memes.length}</span>
            <span className="text-gray-500 text-sm mt-1">Total memes</span>
          </div>
          {/* Placeholder for likes, if available in profile */}
          <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col items-center">
            <span className="text-2xl font-bold">{profile?.likesReceived ?? 0}</span>
            <span className="text-gray-500 text-sm mt-1">Likes received</span>
          </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default UserProfilePage; 