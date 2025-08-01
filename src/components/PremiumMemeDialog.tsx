import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface PlatformSettings {
  commissionRate: number;
  minimumPrice: number;
  maximumPrice: number;
}

interface PremiumMemeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  meme: {
    _id: string;
    url: string;
    title?: string;
    prompt?: string;
    isPremium?: boolean;
    price?: number;
    memeType: 'Meme' | 'GeneratedImage';
  };
}

const PremiumMemeDialog: React.FC<PremiumMemeDialogProps> = ({
  isOpen,
  onClose,
  meme
}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isPremium, setIsPremium] = useState(meme.isPremium || false);
  const [price, setPrice] = useState(meme.price || 5);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  // Fetch platform settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiService.get<PlatformSettings>('/premium/settings');
        setSettings(response);
      } catch (error) {
        console.error('Failed to fetch platform settings:', error);
      }
    };
    
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  // Set premium mutation
  const setPremiumMutation = useMutation({
    mutationFn: async ({ memeId, memeType, isPremium, price }: {
      memeId: string;
      memeType: string;
      isPremium: boolean;
      price: number;
    }) => await apiService.put('/premium/meme/premium', {
      memeId,
      memeType,
      isPremium,
      price
    }, token ?? undefined),
    onSuccess: () => {
      toast.success(`Meme ${isPremium ? 'set as premium' : 'removed from premium'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['my-memes'] });
      queryClient.invalidateQueries({ queryKey: ['premium-memes'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update premium status');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPremium && (!price || price < (settings?.minimumPrice || 1) || price > (settings?.maximumPrice || 1000))) {
      toast.error(`Price must be between $${settings?.minimumPrice || 1} and $${settings?.maximumPrice || 1000}`);
      return;
    }

    setPremiumMutation.mutate({
      memeId: meme._id,
      memeType: meme.memeType,
      isPremium,
      price: isPremium ? price : 0
    });
  };

  const commission = isPremium && settings ? (price * settings.commissionRate / 100) : 0;
  const creatorEarnings = isPremium ? (price - commission) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isPremium ? '💎 Set as Premium' : 'Make Premium Meme'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Premium Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900">Premium Status</h3>
                <p className="text-sm text-gray-600">
                  {isPremium ? 'Your meme will be available for purchase' : 'Make your meme available for purchase'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
              </label>
            </div>

            {/* Price Input */}
            {isPremium && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min={settings?.minimumPrice || 1}
                      max={settings?.maximumPrice || 1000}
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter price"
                    />
                  </div>
                  {settings && (
                    <p className="text-xs text-gray-500 mt-1">
                      Price range: ${settings.minimumPrice} - ${settings.maximumPrice}
                    </p>
                  )}
                </div>

                {/* Commission Info */}
                {settings && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Commission Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Price:</span>
                        <span className="font-semibold">${price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Commission ({settings.commissionRate}%):</span>
                        <span className="font-semibold text-red-600">-${commission.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-900 font-semibold">Your Earnings:</span>
                          <span className="font-bold text-green-600">${creatorEarnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Meme Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Meme Preview</h4>
              <div className="flex items-center gap-3">
                <img
                  src={meme.url.startsWith('http') ? meme.url : `/assets/${meme.url}`}
                  alt={meme.title || meme.prompt || 'Meme'}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {meme.title || meme.prompt || 'Untitled Meme'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {meme.memeType === 'GeneratedImage' ? 'AI Generated' : 'Custom Creation'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={setPremiumMutation.isPending}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {setPremiumMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  isPremium ? 'Update Premium' : 'Make Premium'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PremiumMemeDialog; 