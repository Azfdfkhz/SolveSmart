import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← Tambahkan ini
import { useAuth } from '../context/AuthContext';
import { FaBell, FaUserCircle, FaHome, FaComments, FaCog, FaUser, FaPaperPlane } from 'react-icons/fa'; // ← Ganti icon

const Home = () => {
  const [activeTab, setActiveTab] = useState('Template');
  const { user } = useAuth();
  const navigate = useNavigate(); // ← Hook untuk pindah halaman

  const tabs = ['Template', 'Web', 'Topik', 'Petisi'];

  const products = [
    {
      title: 'Judul',
      subtitle: 'Deskripsi',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop'
    },
    {
      title: 'Judul',
      subtitle: 'Deskripsi',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700">
      {/* Header */}
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
              <button className="relative p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition">
                <FaBell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-full px-4 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-black">
                    {user ? user.displayName : "Guest"}
                  </p>
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

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {user ? user.displayName : "Nama User"}
          </h2>
          <p className="text-blue-100 text-sm">
            Hai solusi cerdas harga paling cemas...
          </p>
        </div>

        {/* Hero Banner */}
        <div className="mb-6 relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=400&fit=crop"
            alt="Banner"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60"></div>
          <div className="absolute inset-0 flex items-center px-8">
            <div className="text-white max-w-xl">
              <h1 className="text-5xl font-bold mb-2">Iklan</h1>
              <p className="text-lg opacity-90">Promosikan bisnis Anda dengan solusi cerdas</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'bg-white bg-opacity-20 text-black hover:bg-opacity-30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div className="space-y-4 mb-8">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden flex">
              <img
                src={product.image}
                alt={product.title}
                className="w-32 h-32 object-cover"
              />
              <div className="flex-1 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{product.title}</h3>
                  <p className="text-sm text-gray-600">{product.subtitle}</p>
                </div>
                <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-2xl px-8 py-4">
          <div className="flex items-center space-x-8">
            {/* Home Button */}
            <button className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition shadow-lg">
                <FaHome className="text-xl" />
              </div>
            </button>

            {/* Chat Button (NEW) */}
            <button
              onClick={() => navigate("/chat")} // 👈 arahkan ke Chat.jsx
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition">
                <FaPaperPlane className="text-xl" /> {/* ganti icon chat */}
              </div>
            </button>

            {/* Settings */}
            <button className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition">
                <FaCog className="text-xl" />
              </div>
            </button>

            {/* Profile */}
            <button className="flex flex-col items-center group">
              <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition">
                <FaUser className="text-xl" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
