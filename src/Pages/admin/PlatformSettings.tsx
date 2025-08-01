import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/axiosInstance';
import { useAuth } from '../../components/AuthContext';
import toast from 'react-hot-toast';

interface PlatformSettings {
  commissionRate: number;
  minimumPrice: number;
  maximumPrice: number;
  updatedBy: string;
  updatedAt: string;
}

const PlatformSettings: React.FC = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    commissionRate: 10,
    minimumPrice: 1,
    maximumPrice: 1000
  });

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ['platform-settings'],
    queryFn: async () => await apiService.get<PlatformSettings>('/premium/settings'),
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => 
      await apiService.put('/premium/settings', data, token ?? undefined),
    onSuccess: () => {
      toast.success('Platform settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update platform settings');
    }
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setForm({
        commissionRate: settings.commissionRate,
        minimumPrice: settings.minimumPrice,
        maximumPrice: settings.maximumPrice
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.minimumPrice >= form.maximumPrice) {
      toast.error('Minimum price must be less than maximum price');
      return;
    }

    if (form.commissionRate < 0 || form.commissionRate > 100) {
      toast.error('Commission rate must be between 0% and 100%');
      return;
    }

    updateMutation.mutate(form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Access Denied</h3>
          <p className="text-red-600">Only super admins can access platform settings.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
          <p className="text-gray-600">
            Configure commission rates and pricing limits for premium memes. These settings affect all creators on the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Commission Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="commissionRate"
                    value={form.commissionRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter commission rate"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Percentage of each sale that goes to the platform
                </p>
              </div>

              {/* Minimum Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="minimumPrice"
                    value={form.minimumPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter minimum price"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lowest price creators can set for premium memes
                </p>
              </div>

              {/* Maximum Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="maximumPrice"
                    value={form.maximumPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter maximum price"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Highest price creators can set for premium memes
                </p>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  'Update Settings'
                )}
              </button>
            </form>
          </div>

          {/* Current Settings & Info */}
          <div className="space-y-6">
            {/* Current Settings */}
            {settings && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Commission Rate</p>
                      <p className="text-2xl font-bold text-purple-600">{settings.commissionRate}%</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Price Range</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${settings.minimumPrice} - ${settings.maximumPrice}
                      </p>
                    </div>
                    <div className="text-3xl">💎</div>
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    <p>Last updated by: {settings.updatedBy}</p>
                    <p>Last updated: {new Date(settings.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 How it works</h3>
              
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Creators can set their memes as premium with a price between the minimum and maximum limits.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>The platform takes a commission from each sale based on the commission rate.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Creators receive the remaining amount after commission deduction.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>These settings affect all premium meme transactions on the platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings; 