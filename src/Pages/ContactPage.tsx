import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/axiosInstance';
import PageLayout from '../components/PageLayout';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiService.post('/contact', data);
      toast.success('Thank you for your message! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
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
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have a question, suggestion, or just want to say hello? We'd love to hear from you!
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Contact Information - Left Side */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Contact Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                        📧
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <p className="text-gray-600">support@memeforge.com</p>
                        <p className="text-gray-600">info@memeforge.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
                        ⏰
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Response Time</h4>
                        <p className="text-gray-600">Within 24 hours</p>
                        <p className="text-gray-600">Monday - Friday</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                        💬
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Live Chat</h4>
                        <p className="text-gray-600">Available 24/7</p>
                        <p className="text-gray-600">For urgent matters</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Our Location
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                        📍
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Office Address</h4>
                        <p className="text-gray-600">123 Tech Street, Silicon Valley</p>
                        <p className="text-gray-600">San Francisco, CA 94105</p>
                        <p className="text-gray-600">United States</p>
                      </div>
                    </div>
                    
                    <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjYiTiAxMjLCsDI1JzA5LjgiVw!5e0!3m2!1sen!2sus!4v1234567890"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="MemeForge Office Location"
                        className="absolute inset-0"
                      />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Visit us during business hours: Mon-Fri 9AM-6PM PST
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Frequently Asked Questions
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        How do I create my first meme?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Simply click on "Create" in the navigation, upload an image or use our AI generator, add your text, and voilà!
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Can I sell my memes?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Yes! Premium users can sell their memes. Just mark your meme as premium and set your price.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        How do I report inappropriate content?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Use the report button on any meme, or contact us directly through this form.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form - Right Side */}
              <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 h-fit">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      id="name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                        errors.name 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      } focus:outline-none`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      type="email"
                      id="email"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      } focus:outline-none`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

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
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      {...register('message', { 
                        required: 'Message is required',
                        minLength: {
                          value: 10,
                          message: 'Message must be at least 10 characters long'
                        }
                      })}
                      id="message"
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors resize-none ${
                        errors.message 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                      } focus:outline-none`}
                      placeholder="Tell us what's on your mind..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending Message...
                      </span>
                    ) : (
                      'Send Message'
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