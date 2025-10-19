import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaGoogle, FaRocket, FaShieldAlt, FaBolt, FaStar, FaChevronRight } from "react-icons/fa";

const LoginPage = () => {
  const { user, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // 🔹 Redirect jika user sudah login
  useEffect(() => {
    if (user && !loading) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  // 🔹 Handle login Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError("");
      await loginWithGoogle();
    } catch (error) {
      console.error("Login Google gagal:", error);
      setError("Gagal login dengan Google. Silakan coba lagi.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white animate-shoot"
            style={{
              top: `${20 + i * 30}%`,
              left: `${-10 + i * 10}%`,
              animationDelay: `${i * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
          
          {/* Premium Header */}
          <div className="relative p-12 text-center bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-500/20 border-b border-white/10">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            
            <div className="relative z-10">
              {/* Animated Logo */}
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform transition-transform duration-500 hover:scale-105">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <FaRocket className="text-white text-3xl animate-float" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-4 tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                SolveSmart
              </h1>
              <p className="text-white/70 text-lg font-light mb-2">
                AI-Powered Solution Platform
              </p>
              
              {/* Features Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 mt-4">
                <FaStar className="text-yellow-400 text-sm" />
                <span className="text-white/80 text-sm font-medium">Premium Experience</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-12">
            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center group">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/15 transition-all duration-300 backdrop-blur-sm border border-white/10">
                  <FaShieldAlt className="text-white text-lg" />
                </div>
                <p className="text-white/70 text-xs font-medium">Secure</p>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/15 transition-all duration-300 backdrop-blur-sm border border-white/10">
                  <FaBolt className="text-white text-lg" />
                </div>
                <p className="text-white/70 text-xs font-medium">Fast</p>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/15 transition-all duration-300 backdrop-blur-sm border border-white/10">
                  <FaRocket className="text-white text-lg" />
                </div>
                <p className="text-white/70 text-xs font-medium">Modern</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-sm text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  {error}
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500"></div>
              
              {/* Main Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn || loading}
                className="relative w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white py-5 px-6 rounded-2xl font-semibold flex items-center justify-center gap-4 transition-all duration-500 hover:bg-white/15 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Loading State */}
                {isLoggingIn ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-lg">Memproses...</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <FaGoogle className="text-2xl transition-transform duration-300 group-hover:scale-110" />
                      {/* Icon Glow */}
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-sm scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className="text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Login dengan Google
                    </span>
                    <FaChevronRight className={`text-white/60 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                  </>
                )}
              </button>

              {/* Floating particles around button */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 animate-ping"></div>
            </div>

            {/* Footer Text */}
            <div className="text-center mt-8">
              <p className="text-white/50 text-sm font-light">
                Dengan login, Anda menyetujui{' '}
                <span className="text-white/70 hover:text-white cursor-pointer transition-colors duration-200">
                  Terms of Service
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : user ? 'bg-green-400' : 'bg-blue-400'}`}></div>
            <span className="text-white/60 text-sm">
              {loading ? "Memeriksa sesi..." : user ? "Sudah login" : "Siap login"}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;