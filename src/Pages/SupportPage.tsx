import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/axiosInstance';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../components/AuthContext';
import { Link } from 'react-router-dom';

interface SupportFormData {
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  attachments?: File[];
}

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { user, isAuthenticated } = useAuth();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SupportFormData>({
    defaultValues: {
      category: 'general'
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SupportFormData) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to submit a support ticket');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('category', data.category);
      
      // Add attachments
      attachments.forEach((file, index) => {
        formData.append('attachments', file);
      });

      await apiService.post('/support', formData);
      toast.success('Support ticket created successfully! We\'ll get back to you soon.');
      reset();
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error('Failed to create support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Need help? We're here to assist you with any questions or issues you might have.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Support Information - Left Side */}
              <div className="space-y-6">
                {/* Quick Help */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Quick Help
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">
                        🔧
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Technical Issues</h4>
                        <p className="text-gray-600 text-sm">
                          Problems with meme creation, uploads, or app functionality
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg">
                        💳
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Billing & Payments</h4>
                        <p className="text-gray-600 text-sm">
                          Questions about premium features, subscriptions, or payments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-lg">
                        💡
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Feature Requests</h4>
                        <p className="text-gray-600 text-sm">
                          Suggestions for new features or improvements
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white text-lg">
                        🐛
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Bug Reports</h4>
                        <p className="text-gray-600 text-sm">
                          Report bugs or unexpected behavior
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Times */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Response Times
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-semibold text-red-800">Urgent Issues</span>
                      <span className="text-red-600 font-medium">2-4 hours</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-semibold text-yellow-800">High Priority</span>
                      <span className="text-yellow-600 font-medium">4-8 hours</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-semibold text-blue-800">Medium Priority</span>
                      <span className="text-blue-600 font-medium">24 hours</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-semibold text-green-800">Low Priority</span>
                      <span className="text-green-600 font-medium">48 hours</span>
                    </div>
                  </div>
                </div>

                {/* Other Ways to Get Help */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Other Ways to Get Help
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                        📧
                      </div>
                      <span className="font-medium">Email Support</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                        💬
                      </div>
                      <span className="font-medium">Live Chat</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                        📚
                      </div>
                      <span className="font-medium">Help Center</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Form - Right Side */}
              <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 h-fit">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Create Support Ticket
                </h2>
                
                {!isAuthenticated && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <p className="text-yellow-800 text-sm">
                      Please <Link to="/signin" className="font-semibold underline">sign in</Link> to submit a support ticket.
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      {...register('subject', { required: 'Subject is required' })}
                      type="text"
                      id="subject"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                        errors.subject 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      } focus:outline-none`}
                      placeholder="Brief description of your issue"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      id="category"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                        errors.category 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      } focus:outline-none`}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payment</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="bug_report">Bug Report</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: {
                          value: 20,
                          message: 'Description must be at least 20 characters long'
                        }
                      })}
                      id="description"
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors resize-none ${
                        errors.description 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      } focus:outline-none`}
                      placeholder="Please provide detailed information about your issue..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="attachments" className="block text-sm font-semibold text-gray-700 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                      <input
                        type="file"
                        id="attachments"
                        multiple
                        accept="image/*,.pdf,.txt,.log,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="attachments" className="cursor-pointer">
                        <div className="text-4xl mb-2">📎</div>
                        <p className="text-gray-600 mb-1">
                          <span className="text-purple-600 font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-gray-500 text-sm">
                          Screenshots, logs, documents (Max 5 files, 10MB each)
                        </p>
                      </label>
                    </div>
                    
                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Selected files:</p>
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                📄
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isAuthenticated}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Ticket...
                      </span>
                    ) : (
                      'Create Support Ticket'
                    )}
                  </button>
                                 </form>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 