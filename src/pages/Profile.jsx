import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiSettings, 
  FiShoppingBag, 
  FiAward, 
  FiBarChart2, 
  FiLogOut, 
  FiChevronRight, 
  FiShield,
  FiStar,
  FiPackage,
  FiCheck,
  FiClock,
  FiX,
  FiDownload,
  FiDollarSign
} from 'react-icons/fi';

import Navbar from '../components/Navbar'; 

const Profile = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getUserOrders } = useOrder();
  const navigate = useNavigate();
  
  const [userOrders, setUserOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load user orders
  useEffect(() => {
    if (user) {
      const orders = getUserOrders();
      setUserOrders(orders);
    }
  }, [user, getUserOrders]);

  // Hitung statistik
  const purchaseCount = userOrders.length;
  const completedOrders = userOrders.filter(order => order.status === 'completed').length;
  const totalSpent = userOrders
    .filter(order => order.status === 'completed')
    .reduce((total, order) => total + order.totalAmount, 0);

  // Menu items untuk profile page
  const menuItems = [
    {
      icon: FiShoppingBag,
      title: 'Riwayat Pembelian',
      subtitle: `Lihat ${purchaseCount} transaksi Anda`,
      color: 'from-blue-500 to-cyan-500',
      onClick: () => setShowOrders(true),
      show: true
    },
    {
      icon: FiAward,
      title: 'Premium Membership', 
      subtitle: 'Upgrade ke akun premium',
      color: 'from-amber-500 to-orange-500',
      onClick: () => navigate('/premium'),
      show: !isAdmin
    },
    {
      icon: FiBarChart2,
      title: 'Data Statistika',
      subtitle: 'Analisis data penggunaan',
      color: 'from-emerald-500 to-teal-500',
      onClick: () => navigate('/statistics'),
      show: true
    },
    {
      icon: FiPackage,
      title: 'Kelola Produk',
      subtitle: 'Tambah dan edit produk',
      color: 'from-purple-500 to-pink-500',
      onClick: () => navigate('/admin/products'),
      show: isAdmin
    },
    {
      icon: FiSettings,
      title: 'Pengaturan Akun',
      subtitle: 'Kelola preferensi Anda',
      color: 'from-indigo-500 to-purple-500',
      onClick: () => navigate('/settings'),
      show: true
    }
  ].filter(item => item.show);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const getStatusColor = (status, paymentStatus) => {
    if (status === 'rejected') return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (status === 'completed') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (status === 'accepted') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (paymentStatus === 'paid') return 'bg-green-500/20 text-green-300 border-green-500/30';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusText = (status, paymentStatus) => {
    if (status === 'rejected') return 'Ditolak';
    if (status === 'completed') return 'Selesai';
    if (status === 'accepted') return 'Diterima';
    if (status === 'pending') return 'Menunggu Konfirmasi';
    if (paymentStatus === 'paid') return 'Sudah Bayar';
    if (status === 'accepted') return 'Menunggu Pembayaran';
    return 'Pending';
  };

  const getStatusIcon = (status, paymentStatus) => {
    if (status === 'completed') return <FiCheck className="w-4 h-4" />;
    if (status === 'rejected') return <FiX className="w-4 h-4" />;
    if (paymentStatus === 'paid') return <FiDollarSign className="w-4 h-4" />;
    return <FiClock className="w-4 h-4" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Data user dari Firebase
  const userDisplayName = user.displayName || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || 'No email';
  const userInitial = userDisplayName.charAt(0).toUpperCase();
  const userSince = user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('id-ID') : 'Recent';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full blur-3xl opacity-20"></div>
      </div>
        <Navbar />
      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-20"> {/* pt-20 untuk memberi space untuk navbar top */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button 
            onClick={() => showOrders ? setShowOrders(false) : navigate(-1)}
            className="p-2 sm:p-3 bg-blue-800/40 backdrop-blur-sm rounded-xl border border-blue-700/30 text-blue-300 hover:text-white hover:bg-blue-700/50 transition-all duration-300"
          >
            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {showOrders ? 'Riwayat Pembelian' : 'Profile'}
          </h1>
          <div className="w-8 h-8 sm:w-10 sm:h-10"></div>
        </div>

        {!showOrders ? (
          /* PROFILE VIEW */
          <>
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-blue-800/30 to-cyan-800/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-blue-700/30 shadow-2xl shadow-blue-900/20 mb-6 sm:mb-8">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                    {userInitial}
                  </div>
                  {isAdmin && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                      <FiShield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {userDisplayName}
                  </h2>
                  <p className="text-blue-200 text-sm sm:text-base truncate">{userEmail}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isAdmin 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                      Verified
                    </span>
                  </div>
                  <p className="text-blue-400 text-xs mt-2">
                    Bergabung sejak {userSince}
                  </p>
                </div>
              </div>

              {/* Stats - Data real dari orders */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-700/30">
                <div className="text-center">
                  <div className="text-white font-bold text-lg sm:text-xl">
                    {purchaseCount}
                  </div>
                  <div className="text-blue-300 text-xs sm:text-sm">Pembelian</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg sm:text-xl">
                    {completedOrders}
                  </div>
                  <div className="text-blue-300 text-xs sm:text-sm">Selesai</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg sm:text-xl">
                    {formatCurrency(totalSpent)}
                  </div>
                  <div className="text-blue-300 text-xs sm:text-sm">Total Belanja</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={item.onClick}
                  className="group bg-gradient-to-br from-blue-800/20 to-purple-900/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-700/30 hover:border-cyan-500/40 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-cyan-900/20 transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">{item.title}</h3>
                        <p className="text-blue-300 text-xs sm:text-sm">{item.subtitle}</p>
                      </div>
                    </div>
                    <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Access */}
            {isAdmin ? (
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-900/20 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FiBarChart2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    Admin Dashboard
                  </h3>
                  <p className="text-blue-200 text-sm sm:text-base mb-4">
                    Kelola sistem, produk, dan monitor aktivitas pengguna
                  </p>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-900/30 hover:shadow-xl hover:shadow-cyan-900/40 transform hover:-translate-y-0.5"
                  >
                    Buka Dashboard Admin
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FiStar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    Customer Dashboard
                  </h3>
                  <p className="text-blue-200 text-sm sm:text-base mb-4">
                    Lihat riwayat pembelian dan statistik penggunaan Anda
                  </p>
                  <button 
                    onClick={() => setShowOrders(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-900/40 transform hover:-translate-y-0.5"
                  >
                    Lihat Riwayat Saya
                  </button>
                </div>
              </div>
            )}

            {/* Logout Section */}
            <div className="bg-gradient-to-br from-blue-800/20 to-red-900/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-red-700/30">
              <button 
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 py-4 px-6 rounded-xl font-semibold hover:from-red-600/30 hover:to-red-700/30 transition-all duration-300 border border-red-500/30 hover:border-red-400/40 flex items-center justify-center space-x-3 group"
              >
                <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Logout Account</span>
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-blue-400 text-xs">
                  User ID: {user?.uid?.substring(0, 8)}...
                </p>
                <p className="text-blue-500 text-xs mt-1">
                  {isAdmin ? 'Role: Administrator' : 'Role: Customer'}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* ORDERS HISTORY VIEW */
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-800/30 to-cyan-800/20 backdrop-blur-xl rounded-2xl p-4 border border-blue-700/30 text-center">
                <div className="text-white font-bold text-xl">{purchaseCount}</div>
                <div className="text-blue-300 text-sm">Total Pesanan</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30 text-center">
                <div className="text-white font-bold text-xl">{completedOrders}</div>
                <div className="text-green-300 text-sm">Selesai</div>
              </div>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingBag className="text-6xl text-blue-300 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Belum ada pesanan</h3>
                <p className="text-blue-200 mb-6">Mulai berbelanja dan pesanan Anda akan muncul di sini</p>
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-gradient-to-br from-blue-800/20 to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-700/30 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">Order #{order.id.slice(-8).toUpperCase()}</h3>
                        <p className="text-blue-300 text-sm">
                          {order.createdAt.toLocaleDateString('id-ID')} • {order.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white text-lg">{formatCurrency(order.totalAmount)}</p>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status, order.paymentStatus)}`}>
                          {getStatusIcon(order.status, order.paymentStatus)}
                          <span>{getStatusText(order.status, order.paymentStatus)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-2">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-8 h-8 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium truncate">{item.title}</p>
                            <p className="text-blue-300">
                              {formatCurrency(item.price)} x {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items && order.items.length > 2 && (
                        <p className="text-blue-400 text-sm">
                          +{order.items.length - 2} item lainnya...
                        </p>
                      )}
                    </div>

                    {/* Delivery Files */}
                    {order.deliveryFiles && order.deliveryFiles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-700/30">
                        <p className="text-blue-300 text-sm font-medium mb-2">File Pengiriman:</p>
                        <div className="space-y-1">
                          {order.deliveryFiles.map((file, index) => (
                            <a
                              key={index}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiDownload className="w-3 h-3" />
                              <span>{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-blue-700/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Detail Pesanan</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-blue-300 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-700/30">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-300">Order ID</p>
                      <p className="text-white font-medium">#{selectedOrder.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Tanggal</p>
                      <p className="text-white font-medium">{selectedOrder.createdAt.toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Status</p>
                      <p className="text-white font-medium capitalize">{selectedOrder.status}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Pembayaran</p>
                      <p className="text-white font-medium capitalize">{selectedOrder.paymentStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Items Pesanan</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-blue-900/10 rounded-xl p-3">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{item.title}</p>
                          <p className="text-blue-300 text-xs">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-700/30">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-bold text-lg">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedOrder.adminNotes && (
                  <div className="bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/30">
                    <h4 className="text-yellow-300 font-semibold mb-2">Catatan Admin</h4>
                    <p className="text-yellow-200 text-sm">{selectedOrder.adminNotes}</p>
                  </div>
                )}

                {/* Delivery Files */}
                {selectedOrder.deliveryFiles && selectedOrder.deliveryFiles.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">File Pengiriman</h4>
                    <div className="space-y-2">
                      {selectedOrder.deliveryFiles.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 bg-cyan-900/20 rounded-xl p-3 border border-cyan-700/30 hover:border-cyan-500/50 transition-colors"
                        >
                          <FiDownload className="w-4 h-4 text-cyan-400" />
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{file.name}</p>
                            <p className="text-cyan-300 text-xs">{file.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacing untuk navbar bottom */}
      <div className="h-24"></div>
    </div>
  );
};

export default Profile;