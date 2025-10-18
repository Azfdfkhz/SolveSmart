// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const { user, login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 🔹 Redirect jika user sudah login
  useEffect(() => {
    console.log("LoginPage - Current user:", user);
    console.log("LoginPage - Loading:", loading);
    
    if (user && !loading) {
      console.log("User sudah login, redirecting to home...");
      navigate("/home");
    }
  }, [user, loading, navigate]);

  // 🔹 Handle login Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError("");
      console.log("Starting Google login...");
      
      await loginWithGoogle();
      console.log("Google login successful");
      
    } catch (error) {
      console.error("Login Google gagal:", error);
      setError("Gagal login dengan Google. Coba lagi ya!");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 🔹 Handle login dengan email/password
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    try {
      setIsLoggingIn(true);
      setError("");
      console.log("Starting email login...");
      
      await login(email, password);
      console.log("Email login successful");
      
    } catch (error) {
      console.error("Login email gagal:", error);
      
      let errorMessage = "Gagal login";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Email tidak valid";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User tidak ditemukan";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Password salah";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Terlalu banyak percobaan, coba lagi nanti";
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SolveSmart</h1>
          <p className="text-gray-600">Masuk ke akun Anda</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn || loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-3 hover:bg-gray-50 transition duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <FaGoogle className="text-red-500 text-lg" />
          )}
          <span>
            {isLoggingIn ? "Sedang login..." : "Login dengan Google"}
          </span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">atau dengan email</span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
                required
                disabled={isLoggingIn}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan password"
                required
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoggingIn}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sedang login...
              </>
            ) : (
              'Masuk dengan Email'
            )}
          </button>
        </form>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Status:</strong> {loading ? "Memeriksa sesi..." : "Siap login"}
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            User: {user ? "Logged in" : "Not logged in"}
          </p>
        </div>

        {/* Test Credentials */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800 text-center">
            <strong>Tips:</strong> Pastikan email sudah terdaftar di Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;