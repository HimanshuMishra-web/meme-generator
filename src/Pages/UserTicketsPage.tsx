import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/axiosInstance';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../components/AuthContext';
import { Link } from 'react-router-dom';
import { ASSETS_URL } from '../../constants';

interface SupportTicket {
  _id: string;
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SupportTicketsResponse {
  support: SupportTicket[];
  total: number;
  page: number;
  totalPages: number;
}

export default function UserTicketsPage() {
  const { user, isAuthenticated } = useAuth();

  // Fetch user's support tickets
  const { data: supportTickets, isLoading: loadingSupport } = useQuery<SupportTicketsResponse>({
    queryKey: ['user-support-tickets'],
    queryFn: async () => {
      console.log('Fetching support tickets...');
      const response = await apiService.get<SupportTicketsResponse>('/support/my-tickets');
      console.log('Support tickets response:', response);
      return response;
    },
    enabled: isAuthenticated,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                My Support Tickets
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Please sign in to view your submitted support tickets.
              </p>
              <Link
                to="/signin"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              My Support Tickets
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your support tickets with responses from our team.
            </p>
          </div>

                    <div className="max-w-6xl mx-auto">
            {loadingSupport ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your support tickets...</p>
              </div>
            ) : !supportTickets?.support || supportTickets.support.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Support Tickets Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any support tickets yet.
                </p>
                <Link
                  to="/support"
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Create Support Ticket
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {supportTickets.support?.map((ticket: SupportTicket) => (
                  <div key={ticket._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {ticket.subject}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Category: {ticket.category.replace('_', ' ').toUpperCase()}</span>
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                    </div>
                    
                                         {ticket.attachments && ticket.attachments.length > 0 && (
                       <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                         <h4 className="font-semibold text-gray-900 mb-2">Attachments:</h4>
                         <div className="flex flex-wrap gap-2">
                           {ticket.attachments.map((attachment, index) => (
                             <a
                               key={index}
                               href={`${ASSETS_URL}${attachment}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                               title={attachment.split('/').pop()}
                             >
                               <span className="text-lg">📎</span>
                               <span className="text-sm text-gray-700">Attachment {index + 1}</span>
                             </a>
                           ))}
                         </div>
                       </div>
                     )}
                     
                     {ticket.notes && (
                       <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                         <h4 className="font-semibold text-blue-900 mb-2">Response from Support Team:</h4>
                         <p className="text-blue-800 text-sm">{ticket.notes}</p>
                       </div>
                     )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 