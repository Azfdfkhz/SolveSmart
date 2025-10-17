// components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, provider, db } from "../firebase";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Simpan user ke Firestore kalau belum ada
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          loginMethod: "google",
          createdAt: new Date(),
        });
      }

      login({
        id: user.uid,
        name: user.displayName,
        email: user.email,
        loginMethod: "google",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Login dengan Google gagal");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Login Demo
  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const demoEmail = "demo@solvesmart.com";
      const demoPass = "demo123";

      // 🔸 Cek apakah akun demo sudah ada
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          // Buat akun demo baru
          userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "Demo User",
            email: demoEmail,
            uid: userCredential.user.uid,
            loginMethod: "demo",
            createdAt: new Date(),
          });
        } else {
          throw err;
        }
      }

      const user = userCredential.user;
      login({
        id: user.uid,
        name: "Demo User",
        email: demoEmail,
        loginMethod: "demo",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Demo login error:", error);
      alert("Gagal login sebagai demo user!");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Manual Login / Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password) {
        alert("Email dan password harus diisi!");
        setIsLoading(false);
        return;
      }

      if (!isLogin) {
        if (!formData.name) {
          alert("Nama harus diisi!");
          setIsLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert("Password dan konfirmasi password tidak sama!");
          setIsLoading(false);
          return;
        }

        // 🔹 Register
        const res = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = res.user;

        await setDoc(doc(db, "users", user.uid), {
          name: formData.name,
          email: formData.email,
          uid: user.uid,
          loginMethod: "manual",
          createdAt: new Date(),
        });

        login({
          id: user.uid,
          name: formData.name,
          email: formData.email,
          loginMethod: "manual",
        });

        navigate("/dashboard");
      } else {
        // 🔹 Login
        const res = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = res.user;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        login({
          id: user.uid,
          name: userData?.name || "User",
          email: user.email,
          loginMethod: "manual",
        });

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error.message);
      if (error.message.includes("auth/invalid-credential"))
        alert("Email atau password salah!");
      else if (error.message.includes("auth/email-already-in-use"))
        alert("Email sudah digunakan!");
      else alert("Terjadi error, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Solve Smart Company
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            {isLogin ? "Login" : "Daftar"}
          </h2>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-4 px-4 text-gray-700 font-medium hover:bg-gray-50 transition duration-200 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-xl" />
          <span>{isLoading ? "Loading..." : "Login With Google"}</span>
        </button>

        {/* 🔹 Tombol Demo Login */}
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white rounded-xl py-4 px-4 font-medium hover:bg-gray-700 transition duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? "Loading..." : "Login as Demo User"}</span>
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">ATAU</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Form Login / Register */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Konfirmasi Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : (
              <span>{isLogin ? "Login" : "Daftar"}</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={handleToggleMode}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            {isLogin
              ? "Belum punya akun? Daftar di sini"
              : "Sudah punya akun? Login di sini"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
