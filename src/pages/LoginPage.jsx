// src/pages/LoginPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../components/Login";

const LoginPage = () => {
  const { user, isAuthenticated, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  // 🔹 Kalau user sudah login, redirect otomatis ke dashboard
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  // 🔹 Handle login Google
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(); // langsung pakai Firebase redirect
    } catch (error) {
      console.error("Login Google gagal:", error);
      alert("Gagal login dengan Google. Coba lagi ya!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-6">Login ke SolveSmart</h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-4 px-4 text-gray-700 font-medium hover:bg-gray-50 transition duration-200"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span>Login dengan Google</span>
        </button>

        <p className="text-sm text-gray-500 mt-6">
          {loading ? "Memeriksa sesi login..." : "Gunakan akun Google Anda"}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
