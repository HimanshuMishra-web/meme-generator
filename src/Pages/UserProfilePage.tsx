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
  isPublic?: boolean;
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
  const [form, setForm] = useState<{ name: string; bio: string; avatar: File | null; isPublic: boolean }>({ name: '', bio: '', avatar: null, isPublic: false });
  const [avatarPreview, setAvatarPreview] = useState<string>('');

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
  const { data: memesData, isLoading: loadingMemes, error: errorMemes } = useQuery<{ memes: Meme[] }>({
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

  // Loading/error states
  if (loadingProfile) return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  if (errorProfile) return <div className="flex justify-center items-center min-h-screen text-red-500">Failed to load profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <PageLayout className="flex flex-col items-center w-full">
        {/* Profile Card */}
        <div className="relative w-full max-w-xl mb-8">
          <div className="absolute left-1/2 -top-16 transform -translate-x-1/2 z-10">
            <div className="rounded-full border-4 border-yellow-400 shadow-lg p-1 bg-white">
              <UserAvatar src={avatarPreview || ''} alt="Profile" size={128} className="mb-2" />
            </div>
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
          <div className="bg-white rounded-2xl shadow-xl pt-20 pb-8 px-8 flex flex-col items-center border-t-8 border-yellow-400">
            {editMode ? (
              <form className="flex flex-col items-center w-full" onSubmit={handleSave}>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="text-2xl font-bold mb-1 text-center border-b border-gray-300 focus:outline-none focus:border-yellow-400 bg-gray-50 px-2 py-1 w-64 rounded"
                  required
                />
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="text-gray-600 mb-1 text-center border-b border-gray-300 focus:outline-none focus:border-yellow-400 bg-gray-50 px-2 py-1 w-full max-w-md resize-y rounded"
                  rows={2}
                  placeholder="Add a short bio"
                />
                <div className="flex items-center gap-3 mt-4 mb-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={form.isPublic}
                      onChange={handleChange}
                      className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded focus:ring-yellow-300 focus:ring-2"
                    />
                    <span className="font-medium">Make profile public</span>
                    <span className="text-xs text-gray-500">(Show in community)</span>
                  </label>
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold transition disabled:opacity-60 shadow" disabled={updateMutation.status === 'pending'}>Save</button>
                  <button type="button" className="bg-gray-200 px-6 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-300 transition shadow" onClick={handleCancel} disabled={updateMutation.status === 'pending'}>Cancel</button>
                </div>
                {updateMutation.isError && <div className="text-red-500 mt-2">Failed to update profile.</div>}
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1">{profile?.username}</h2>
                {profile?.isPublic && (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🌐 Public Profile
                    </span>
                  </div>
                )}
                <p className="text-gray-600 mb-1 text-center">{profile?.bio || 'No bio yet.'}</p>
                <p className="text-gray-400 text-sm mb-3">Joined {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : ''}</p>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold transition shadow" onClick={handleEdit}>Edit Profile</button>
              </>
            )}
          </div>
        </div>
        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-8 w-full max-w-3xl justify-center"
        />
        {/* Meme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 w-full max-w-4xl mb-10">
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
        <div className="flex space-x-8 w-full max-w-2xl justify-center mt-2">
          <div className="bg-white rounded-xl shadow p-6 flex-1 flex flex-col items-center border-t-4 border-yellow-400">
            <span className="text-3xl font-bold flex items-center gap-2">🖼️ {memes.length}</span>
            <span className="text-gray-500 text-sm mt-1">Total memes</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex-1 flex flex-col items-center border-t-4 border-yellow-400">
            <span className="text-3xl font-bold flex items-center gap-2">👍 {profile?.likesReceived ?? 0}</span>
            <span className="text-gray-500 text-sm mt-1">Likes received</span>
          </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default UserProfilePage; 