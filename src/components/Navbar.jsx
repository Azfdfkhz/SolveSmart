import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaUserCircle, FaHome, FaComments, FaCog, FaUser, FaHeadset } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navigationHandlers = {
    home: () => navigate('/home'),
    chat: () => {
      if (isAdmin) {
        console.log('Admin navigating to chat monitor');
        navigate('/admin/chat-monitor');
      } else {
        console.log('User navigating to regular chat');
        navigate('/chat');
      }
    },
    settings: () => navigate('/settings'),
    profile: () => navigate('/profile')
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-indigo-900 bg-opacity-50 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
              </div>
              <h1 className="text-xl font-bold text-white">Solve Smart Company</h1>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-white hover:bg-blue-600 hover:bg-opacity-10 rounded-lg transition">
                <FaBell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div 
                className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-full px-4 py-2 cursor-pointer hover:bg-opacity-20 transition"
                onClick={navigationHandlers.profile}
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-black">
                    {user ? user.displayName : "Guest"}
                  </p>
                  {isAdmin && (
                    <p className="text-xs text-green-300">Administrator</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <FaUserCircle className="text-indigo-600 text-xl" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl px-8 py-4 z-50">
        <div className="flex items-center space-x-8">
          {/* Home Button */}
          <button 
            onClick={navigationHandlers.home}
            className="flex flex-col items-center group"
          >
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition shadow-lg">
              <FaHome className="text-xl" />
            </div>
            <span className="text-xs text-gray-600 mt-1 hidden group-hover:block">Home</span>
          </button>

          {/* Chat Button - Berbeda untuk Admin vs User */}
          <button
            onClick={navigationHandlers.chat}
            className="flex flex-col items-center group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isAdmin 
                ? 'bg-green-500 text-white group-hover:bg-green-600 shadow-lg' 
                : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
            }`}>
              {isAdmin ? <FaHeadset className="text-xl" /> : <FaComments className="text-xl" />}
            </div>
            <span className="text-xs text-gray-600 mt-1 hidden group-hover:block">
              {isAdmin ? 'Support' : 'Chat'}
            </span>
          </button>

          {/* Settings */}
          <button 
            onClick={navigationHandlers.settings}
            className="flex flex-col items-center group"
          >
            <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition">
              <FaCog className="text-xl" />
            </div>
            <span className="text-xs text-gray-600 mt-1 hidden group-hover:block">Settings</span>
          </button>

          {/* Profile */}
          <button 
            onClick={navigationHandlers.profile}
            className="flex flex-col items-center group"
          >
            <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition">
              <FaUser className="text-xl" />
            </div>
            <span className="text-xs text-gray-600 mt-1 hidden group-hover:block">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;