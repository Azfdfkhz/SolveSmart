import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "../firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cek hasil login setelah redirect (hanya pertama kali)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Login berhasil setelah redirect:", result.user);
          setUser(result.user);
        }
      })
      .catch((error) => {
        if (error.code !== "auth/no-auth-event") {
          console.error("Error setelah redirect:", error);
        }
      });
  }, []);

  // 🔹 Pantau perubahan user login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Login Google pakai akun browser (redirect)
  const loginWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Login gagal:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
