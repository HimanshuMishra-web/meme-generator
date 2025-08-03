import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import { apiService } from '../../services/axiosInstance';

interface AnalyticsData {
  overview: {
    totalMemes: number;
    totalPublic: number;
    totalPrivate: number;
    totalPremium: number;
    totalApproved: number;
    totalPending: number;
    totalRejected: number;
  };
  memes: {
    total: number;
    public: number;
    private: number;
    premium: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  aiGenerated: {
    total: number;
    public: number;
    private: number;
    premium: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  revenue: {
    totalRevenue: number;
    totalTransactions: number;
    platformEarnings: number;
    sellerEarnings: number;
    avgTransactionValue: number;
  };
  premiumSales: {
    memeSales: {
      totalPremium: number;
      totalSold: number;
      totalEarnings: number;
      avgPrice: number;
    };
    aiSales: {
      totalPremium: number;
      totalSold: number;
      totalEarnings: number;
      avgPrice: number;
    };
  };
  users: {
    totalUsers: number;
    premiumUsers: number;
    regularUsers: number;
  };
  trends: {
    dailyRevenue: Array<{ _id: string; revenue: number; transactions: number }>;
    memeCreation: Array<{ _id: string; count: number }>;
    aiGeneration: Array<{ _id: string; count: number }>;
  };
  dateRange: {
    start: string;
    end: string;
    filter: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Validation function for analytics data
const validateAnalyticsData = (data: any): data is AnalyticsData => {
  return (
    data &&
    typeof data === 'object' &&
    'overview' in data &&
    'memes' in data &&
    'aiGenerated' in data &&
    'revenue' in data &&
    'premiumSales' in data &&
    'users' in data &&
    'trends' in data &&
    'dateRange' in data
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      if (showCustomDate && customStartDate && customEndDate) {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
      } else {
        params.append('filter', dateFilter);
      }

      const response = await apiService.get<any>(`/analytics?${params.toString()}`);
      
      // Handle the response structure properly
      if (response && response.data && typeof response.data === 'object') {
        console.log('Analytics data received:', response.data);
        if (validateAnalyticsData(response.data)) {
          setAnalyticsData(response.data);
        } else {
          console.error('Invalid analytics data structure:', response.data);
          setError('Invalid data structure received from server');
          setAnalyticsData(null);
        }
      } else if (response && typeof response === 'object' && 'overview' in response) {
        // Direct data structure
        console.log('Analytics data received (direct):', response);
        if (validateAnalyticsData(response)) {
          setAnalyticsData(response as AnalyticsData);
        } else {
          console.error('Invalid analytics data structure:', response);
          setError('Invalid data structure received from server');
          setAnalyticsData(null);
        }
      } else {
        console.error('Invalid analytics data structure:', response);
        setError('Invalid data structure received from server');
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, customStartDate, customEndDate, showCustomDate]);

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    setShowCustomDate(false);
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setShowCustomDate(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          </div>
          
          {/* Error State */}
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          </div>
          
          {/* Empty State */}
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-500 mb-6">Start creating memes and generating AI content to see analytics data here.</p>
            
            {/* Sample Layout Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Memes</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$0.00</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Premium Sales</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meme Types Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Status</h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data with fallbacks for empty data
  const memeTypeData = [
    { name: 'Regular Memes', value: analyticsData.memes.total - analyticsData.memes.premium },
    { name: 'Premium Memes', value: analyticsData.memes.premium },
    { name: 'AI Generated', value: analyticsData.aiGenerated.total - analyticsData.aiGenerated.premium },
    { name: 'Premium AI', value: analyticsData.aiGenerated.premium },
  ].filter(item => item.value > 0);

  const publicationStatusData = [
    { name: 'Approved', value: analyticsData.overview.totalApproved },
    { name: 'Pending', value: analyticsData.overview.totalPending },
    { name: 'Rejected', value: analyticsData.overview.totalRejected },
    { name: 'Private', value: analyticsData.overview.totalPrivate },
  ].filter(item => item.value > 0);

  const revenueData = [
    { name: 'Platform Earnings', value: analyticsData.revenue.platformEarnings },
    { name: 'Seller Earnings', value: analyticsData.revenue.sellerEarnings },
  ].filter(item => item.value > 0);

  const userData = [
    { name: 'Regular Users', value: analyticsData.users.regularUsers },
    { name: 'Premium Users', value: analyticsData.users.premiumUsers },
  ].filter(item => item.value > 0);

  // Check if we have any data to show
  const hasMemeData = memeTypeData.length > 0;
  const hasPublicationData = publicationStatusData.length > 0;
  const hasRevenueData = revenueData.length > 0;
  const hasUserData = userData.length > 0;

  // Format trend data for charts
  const formatTrendData = (data: any[], key: string) => {
    return data.map(item => {
      try {
        const date = new Date(item._id);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date in trend data:', item._id);
          return null;
        }
        return {
          date: format(date, 'MMM dd'),
          [key]: item[key] || item.count || 0
        };
      } catch (error) {
        console.warn('Error formatting trend data:', error, item);
        return null;
      }
    }).filter(Boolean);
  };

  const revenueTrendData = formatTrendData(analyticsData.trends.dailyRevenue, 'revenue');
  const memeCreationTrendData = formatTrendData(analyticsData.trends.memeCreation, 'count');
  const aiGenerationTrendData = formatTrendData(analyticsData.trends.aiGeneration, 'count');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          
          {/* Date Filter Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDateFilterChange('today')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateFilter === 'today' && !showCustomDate
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateFilterChange('week')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateFilter === 'week' && !showCustomDate
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => handleDateFilterChange('month')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateFilter === 'month' && !showCustomDate
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => handleDateFilterChange('all')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateFilter === 'all' && !showCustomDate
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Time
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCustomDateSubmit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Memes</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalMemes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.revenue.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.users.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.premiumSales.memeSales.totalSold + analyticsData.premiumSales.aiSales.totalSold}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Meme Types Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meme Types Distribution</h3>
            {hasMemeData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={memeTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {memeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">No meme data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Publication Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Status</h3>
            {hasPublicationData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={publicationStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">No publication data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <p className="text-gray-500">No revenue data available</p>
                </div>
              </div>
            )}
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
            {hasUserData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82CA9D" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500">No user data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trends Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            {revenueTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <p className="text-gray-500">No revenue trends available</p>
                </div>
              </div>
            )}
          </div>

          {/* Meme Creation Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meme Creation Trends</h3>
            {memeCreationTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={memeCreationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#82CA9D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">No meme creation trends available</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Generation Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Generation Trends</h3>
            {aiGenerationTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={aiGenerationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#FF8042" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-gray-500">No AI generation trends available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Meme Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meme Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Memes:</span>
                <span className="font-semibold">{analyticsData.memes.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Public Memes:</span>
                <span className="font-semibold">{analyticsData.memes.public}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Private Memes:</span>
                <span className="font-semibold">{analyticsData.memes.private}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Premium Memes:</span>
                <span className="font-semibold">{analyticsData.memes.premium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Approved:</span>
                <span className="font-semibold">{analyticsData.memes.approved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold">{analyticsData.memes.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rejected:</span>
                <span className="font-semibold">{analyticsData.memes.rejected}</span>
              </div>
            </div>
          </div>

          {/* AI Generated Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Generated Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total AI Generated:</span>
                <span className="font-semibold">{analyticsData.aiGenerated.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Public AI:</span>
                <span className="font-semibold">{analyticsData.aiGenerated.public}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Private AI:</span>
                <span className="font-semibold">{analyticsData.aiGenerated.private}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Premium AI:</span>
                <span className="font-semibold">{analyticsData.aiGenerated.premium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Approved AI:</span>
                <span className="font-semibold">{analyticsData.aiGenerated.approved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending AI:</span>
                <span className="font-semibold">{analyticsData.aiGenerated.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rejected AI:</span>
                <span className="font-semibold">{analyticsData.aiGenerated.rejected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${analyticsData.revenue.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.revenue.totalTransactions}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Platform Earnings</p>
              <p className="text-2xl font-bold text-purple-600">${analyticsData.revenue.platformEarnings.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-2xl font-bold text-orange-600">${analyticsData.revenue.avgTransactionValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Premium Sales Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Premium Meme Sales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Meme Sales</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Premium Memes:</span>
                <span className="font-semibold">{analyticsData.premiumSales.memeSales.totalPremium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sold:</span>
                <span className="font-semibold">{analyticsData.premiumSales.memeSales.totalSold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earnings:</span>
                <span className="font-semibold text-green-600">${analyticsData.premiumSales.memeSales.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Price:</span>
                <span className="font-semibold">${analyticsData.premiumSales.memeSales.avgPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Premium AI Sales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium AI Sales</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Premium AI:</span>
                <span className="font-semibold">{analyticsData.premiumSales.aiSales.totalPremium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sold:</span>
                <span className="font-semibold">{analyticsData.premiumSales.aiSales.totalSold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earnings:</span>
                <span className="font-semibold text-green-600">${analyticsData.premiumSales.aiSales.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Price:</span>
                <span className="font-semibold">${analyticsData.premiumSales.aiSales.avgPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 