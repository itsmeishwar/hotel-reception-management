import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const PasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Back to reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
          <Lock size={24} className="text-orange-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-600 mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hotel.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-orange-600 flex items-center gap-2 justify-center">
            <ArrowLeft size={16} />
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
