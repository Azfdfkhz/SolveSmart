import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setError('Gagal login dengan Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-lg"></div>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">SolveSmart</h1>
              <p className="text-purple-100">Solusi Cerdas untuk Bisnis Anda</p>
            </div>
          </div>

          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
                <div className="flex items-center">
                  <span className="iconify text-xl mr-2" data-icon="mdi:alert-circle"></span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-5 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:border-indigo-400 hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span>Sedang masuk...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="group-hover:text-indigo-600 transition text-lg">
                    Masuk dengan Google
                  </span>
                </>
              )}
            </button>

            {/* Info Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Gunakan akun Google Anda untuk masuk dengan aman
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="iconify text-green-500 text-xl" data-icon="mdi:check-circle"></span>
                <span className="text-sm">Login cepat dan mudah</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="iconify text-green-500 text-xl" data-icon="mdi:check-circle"></span>
                <span className="text-sm">Keamanan terjamin oleh Google</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="iconify text-green-500 text-xl" data-icon="mdi:check-circle"></span>
                <span className="text-sm">Tidak perlu mengingat password</span>
              </div>
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                ~~~~~~
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>🔒 Login aman dengan enkripsi end-to-end</p>
        </div>
      </div>

      {/* Iconify Script */}
      <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>


    </div>
  );
};

export default Login;