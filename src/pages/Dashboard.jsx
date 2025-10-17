// pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBox, FaShoppingCart, FaChartLine, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationCards = [
    {
      title: 'Kelola Produk',
      description: 'Tambah, edit, dan hapus produk',
      icon: <FaBox className="text-2xl" />,
      bgColor: 'bg-blue-500',
      route: '/products'
    },
    {
      title: 'Penjualan',
      description: 'Lihat laporan penjualan',
      icon: <FaChartLine className="text-2xl" />,
      bgColor: 'bg-green-500',
      route: '/sales'
    },
    {
      title: 'Pesanan',
      description: 'Kelola pesanan pelanggan',
      icon: <FaShoppingCart className="text-2xl" />,
      bgColor: 'bg-orange-500',
      route: '/orders'
    }
  ];

  console.log('Dashboard rendered, user:', user); // Debug log

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Selamat Datang, {user?.name}!
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">
                Login method: {user?.loginMethod}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.route)}
              className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition duration-200 border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 ${card.bgColor} text-white rounded-xl`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Produk</h3>
            <p className="text-3xl font-bold text-blue-600">24</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Penjualan Hari Ini</h3>
            <p className="text-3xl font-bold text-green-600">Rp 1.250.000</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pesanan Baru</h3>
            <p className="text-3xl font-bold text-orange-600">5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;