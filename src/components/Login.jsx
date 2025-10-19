import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaShieldAlt, FaBolt, FaCrown, FaGem, FaLightbulb } from 'react-icons/fa';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [lightOn, setLightOn] = useState(true);
  
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setLightOn(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luxury Black Background with Gold Accents */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Gold Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl"></div>
        
        {/* Gold Geometric Patterns */}
        <div className="absolute top-10 right-10 w-32 h-32 border border-amber-500/10 rounded-lg rotate-45"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 border border-amber-500/10 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-amber-500/10 rotate-12"></div>
      </div>

      {/* Subtle Gold Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Elegant Gold Stars */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-amber-300 rounded-full transition-all duration-1000 ${lightOn ? 'opacity-40' : 'opacity-10'}`}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 30}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Premium Black Card Container */}
        <div className="bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden transform transition-all duration-500">
          
          {/* Luxury Header */}
          <div className="relative p-8 text-center border-b border-amber-500/20 bg-gradient-to-b from-gray-800 to-gray-900">
            {/* Decorative Gold Elements */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
            
            {/* Premium Badge */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-full text-xs font-medium">
                <FaCrown className="text-xs" />
                <span>PREMIUM</span>
              </div>
            </div>

            {/* Diamond Decoration */}
            <div className="absolute top-3 right-3">
              <FaGem className="text-amber-300 text-sm" />
            </div>

            <div className="relative z-10">
              {/* Animated Light Bulb Logo */}
              <div className={`w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border ${lightOn ? 'border-amber-400/30' : 'border-amber-600/20'} transition-all duration-500`}>
                <div className="w-14 h-14 bg-gray-700/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaLightbulb className={`text-2xl transition-all duration-500 ${lightOn ? 'text-amber-300' : 'text-amber-600'} ${lightOn ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-200 to-amber-300 bg-clip-text mb-2 tracking-tight">
                SolveSmart
              </h1>
              <p className="text-gray-400 text-sm font-light">
                Smart Solutions, Complete Results
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Minimal Features Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center group">
                <div className={`w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-500/10 transition-all duration-300 border ${lightOn ? 'border-amber-500/20' : 'border-gray-600'}`}>
                  <FaShieldAlt className="text-amber-400 text-lg" />
                </div>
                <p className="text-gray-300 text-xs font-medium">Secure</p>
              </div>
              <div className="text-center group">
                <div className={`w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-500/10 transition-all duration-300 border ${lightOn ? 'border-amber-500/20' : 'border-gray-600'}`}>
                  <FaBolt className="text-amber-400 text-lg" />
                </div>
                <p className="text-gray-300 text-xs font-medium">Elite</p>
              </div>
              <div className="text-center group">
                <div className={`w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-500/10 transition-all duration-300 border ${lightOn ? 'border-amber-500/20' : 'border-gray-600'}`}>
                  <FaLightbulb className={`text-lg transition-all duration-500 ${lightOn ? 'text-amber-300' : 'text-amber-600'}`} />
                </div>
                <p className="text-gray-300 text-xs font-medium">Smart</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-amber-900/20 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-xs">{error}</span>
                </div>
              </div>
            )}

            {/* Elegant Google Login Button - MORE GOLD */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Gold Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
              
              {/* Main Button - Enhanced Gold */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-amber-900/30 to-amber-800/30 border border-amber-500/40 text-amber-100 py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:border-amber-400/60 hover:bg-gradient-to-r hover:from-amber-800/40 hover:to-amber-700/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden shadow-lg"
              >
                {/* Gold Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                {/* Loading State */}
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-amber-400/50 border-t-amber-300 rounded-full animate-spin"></div>
                    <span className="text-sm bg-gradient-to-r from-amber-200 to-amber-300 bg-clip-text text-transparent font-semibold">
                      Accessing Premium...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <FaGoogle className="text-lg text-amber-300 transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-200" />
                      {/* Gold Icon Glow */}
                      <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-sm scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className="text-sm bg-gradient-to-r from-amber-200 to-amber-300 bg-clip-text text-transparent font-semibold">
                      Continue with Google
                    </span>
                    {/* Gold Arrow Indicator */}
                    <div className={`transform transition-all duration-300 ${isHovered ? 'translate-x-1 opacity-100' : 'opacity-0'}`}>
                      <div className="w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
                    </div>
                  </>
                )}
              </button>

              {/* Gold Corner Accents */}
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Security Assurance */}
            <div className="text-center mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-center gap-2 text-amber-500/70 text-xs">
                <FaShieldAlt className="text-amber-400 text-xs" />
                <span>Enterprise Grade Security</span>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-center mt-4">
              <p className="text-gray-500 text-xs">
                By continuing, you agree to our{' '}
                <span className="text-amber-400 hover:text-amber-300 cursor-pointer transition-colors duration-200">
                  Terms
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-gray-900/50 border border-amber-500/20 rounded-full px-4 py-2">
            <div className="flex gap-1">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${lightOn ? 'bg-amber-400' : 'bg-amber-600'}`}></div>
            </div>
            <span className="text-gray-400 text-xs">
              Status: <span className="text-amber-400">Ready</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;