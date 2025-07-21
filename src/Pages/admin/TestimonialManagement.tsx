import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../components/AuthContext';
import { apiService } from '../../services/axiosInstance';
import { generateImageSource } from '../../utils';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Testimonial {
  _id: string;
  profileImage: string;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
}

const TestimonialManagement: React.FC = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    profileImage: '',
    name: '',
    content: '',
    rating: 5,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [dragActive, setDragActive] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Handle image preview cleanup
  useEffect(() => {
    return () => {
      if (typeof imagePreview === 'string') URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Image upload handler
  const handleImageUpload = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('type', 'testimonial');
    try {
      const res = await apiService.post<{ media: any }>('/media/upload', formData, token || undefined);
      setForm(f => ({ ...f, profileImage: res.media.url }));
    } catch (e) {
      alert('Image upload failed');
    } finally {
      setImageFile(null);
      setImagePreview(undefined);
    }
  };

  // Fetch testimonials
  const { data: testimonials = [], isLoading, error } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      return await apiService.get<Testimonial[]>('/testimonials');
    },
  });

  // Create
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiService.post<Testimonial>('/testimonials', data, token || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setIsModalOpen(false);
      setForm({ profileImage: '', name: '', content: '', rating: 5 });
      setImageFile(null);
      setImagePreview(undefined);
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      return await apiService.put<Testimonial>(`/testimonials/${id}`, data, token || undefined, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setIsModalOpen(false);
      setSelected(null);
      setForm({ profileImage: '', name: '', content: '', rating: 5 });
      setImageFile(null);
      setImagePreview(undefined);
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiService.delete(`/testimonials/${id}`, token || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only Super Admins can manage testimonials.</p>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setIsEdit(false);
    setSelected(null);
    setForm({ profileImage: '', name: '', content: '', rating: 5 });
    setIsModalOpen(true);
  };
  const openEdit = (t: Testimonial) => {
    setIsEdit(true);
    setSelected(t);
    setForm({
      profileImage: t.profileImage,
      name: t.name,
      content: t.content,
      rating: t.rating,
    });
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
      setConfirmOpen(false);
    }
  };
  const handleCancelDelete = () => {
    setDeleteId(null);
    setConfirmOpen(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('content', form.content);
    formData.append('rating', String(form.rating));
    if (imageFile) {
      formData.append('profileImage', imageFile);
    } else if (form.profileImage) {
      formData.append('profileImage', form.profileImage);
    }
    if (isEdit && selected) {
      updateMutation.mutate({ id: selected._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
      setImagePreview(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Testimonial Management</h1>
      <button
        onClick={openCreate}
        className="mb-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-full transition"
      >
        Add Testimonial
      </button>
      {isLoading ? (
        <div>Loading testimonials...</div>
      ) : error ? (
        <div className="text-red-600">Error loading testimonials.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.map((t: Testimonial) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.profileImage ? (
                      <img src={generateImageSource(t.profileImage)} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-sm font-medium text-black">{t.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" title={t.content}>{t.content}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                      ))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => openEdit(t)} className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-full transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit' : 'Add'} Testimonial</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <div
                  className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 hover:border-yellow-400'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="testimonial-profile-image-input"
                  />
                  <label htmlFor="testimonial-profile-image-input" className="cursor-pointer">
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-yellow-600 hover:text-yellow-500">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </label>
                  {imagePreview ? (
                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(undefined); setForm(f => ({ ...f, profileImage: '' })); }} className="text-red-500 hover:text-red-700">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : form.profileImage ? (
                    <div className="mt-2 flex items-center justify-center">
                      <img src={form.profileImage} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
                    </div>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={form.rating}
                  onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isEdit ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Testimonial?"
        description="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default TestimonialManagement; 