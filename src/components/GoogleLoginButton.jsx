import React from "react";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../firebase";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Login gagal:", error);
      onError?.(error);
    }
  };

  React.useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Login berhasil:", result.user);
          onSuccess?.(result.user);
        }
      })
      .catch((error) => {
        console.error("Error setelah redirect:", error);
        onError?.(error);
      });
  }, []);

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-4 px-4 text-gray-700 font-medium hover:bg-gray-50 transition duration-200"
    >
      <FcGoogle className="text-xl" />
      <span>Login dengan Google</span>
    </button>
  );
};

export default GoogleLoginButton;
