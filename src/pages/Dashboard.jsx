// pages/Dashboard.jsx (Updated dengan Order Management - COMPLETE)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';
import { useDashboard } from '../context/DashboardContext';
import { 
  FaBox, 
  FaShoppingCart, 
  FaChartLine, 
  FaSignOutAlt, 
  FaUsers, 
  FaDollarSign,
  FaShoppingBag,
  FaCog,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaUser,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSpinner,
  FaUpload,
  FaTimes,
  FaInfoCircle,
  FaRedo,
  FaCheck,
  FaTimesCircle,
  FaFileDownload,
  FaMoneyBillWave,
  FaQrcode,
  FaStickyNote 
} from 'react-icons/fa';
import { 
  FiPackage, 
  FiCheck, 
  FiX, 
  FiClock,
  FiDownload,
  FiDollarSign,
  FiCreditCard
} from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { products, addProduct, deleteProduct, loading: productsLoading, actionLoading } = useProduct();
  const { 
    orders, 
    acceptOrder, 
    rejectOrder, 
    confirmPayment, 
    addDeliveryFiles, 
    completeOrder,
    actionLoading: orderActionLoading,
    getOrderStats 
  } = useOrder();
  const { dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboard();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState(''); // accept, reject, deliver, confirm-payment, complete
  const [adminNotes, setAdminNotes] = useState('');
  const [deliveryFiles, setDeliveryFiles] = useState([{ name: '', url: '', type: '' }]);
  const [activeOrderTab, setActiveOrderTab] = useState('pending'); // pending, accepted, completed
  
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDriveHelp, setShowDriveHelp] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  const fileInputRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    title: '',
    subtitle: '',
    price: '',
    category: '',
    image: ''
  });

  // Filter orders by status
  const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
  const acceptedOrders = orders?.filter(order => order.status === 'accepted') || [];
  const completedOrders = orders?.filter(order => order.status === 'completed') || [];
  const rejectedOrders = orders?.filter(order => order.status === 'rejected') || [];

  // Order statistics
  const orderStats = getOrderStats ? getOrderStats() : {
    totalOrders: orders?.length || 0,
    pendingOrders: pendingOrders.length,
    acceptedOrders: acceptedOrders.length,
    completedOrders: completedOrders.length,
    totalRevenue: completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    monthlyRevenue: 0,
    uniqueCustomers: new Set(orders?.map(order => order.userEmail)).size || 0
  };

  // Function untuk convert Google Drive link
  const convertDriveLink = (url) => {
    try {
      if (!url) return '';
      if (url.includes('uc?export=view')) {
        return url;
      }

      let fileId = '';
      const fileMatch = url.match(/\/d\/([^\/]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      }
      
      const openMatch = url.match(/[?&]id=([^&]+)/);
      if (openMatch) {
        fileId = openMatch[1];
      }

      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }

      return url;
    } catch (err) {
      console.warn('Failed to convert Drive link:', err);
      return url;
    }
  };

  // Function untuk menampilkan info pembayaran
  const renderPaymentInfo = (order) => {
    if (order.paymentMethod === 'qris' && order.paymentStatus === 'unpaid') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
          <div className="flex items-center space-x-2 mb-2">
            <FaQrcode className="text-yellow-600 text-lg" />
            <h4 className="font-semibold text-yellow-800">Menunggu Pembayaran QRIS</h4>
          </div>
          <p className="text-yellow-700 text-sm mb-2">
            Customer telah memilih pembayaran QRIS dan sedang menunggu pembayaran.
          </p>
          <button
            onClick={() => {
              setSelectedOrder(order);
              setActionType('confirm-payment');
              setShowOrderModal(true);
            }}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center space-x-1"
          >
            <FaCheck className="text-xs" />
            <span>Konfirmasi Pembayaran</span>
          </button>
        </div>
      );
    }

    if (order.paymentMethod === 'qris' && order.paymentStatus === 'paid') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <div className="flex items-center space-x-2">
            <FaQrcode className="text-green-600 text-lg" />
            <h4 className="font-semibold text-green-800">QRIS - Sudah Dibayar</h4>
          </div>
          <p className="text-green-700 text-sm">
            Pembayaran via QRIS telah dikonfirmasi.
          </p>
        </div>
      );
    }

    if (order.paymentMethod === 'cash') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <div className="flex items-center space-x-2">
            <FaMoneyBillWave className="text-blue-600 text-lg" />
            <h4 className="font-semibold text-blue-800">Pembayaran Cash</h4>
          </div>
          <p className="text-blue-700 text-sm">
            Customer memilih pembayaran cash. Pastikan untuk konfirmasi penerimaan pembayaran.
          </p>
          {order.paymentStatus === 'unpaid' && (
            <button
              onClick={() => {
                setSelectedOrder(order);
                setActionType('confirm-payment');
                setShowOrderModal(true);
              }}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center space-x-1 mt-2"
            >
              <FaCheck className="text-xs" />
              <span>Konfirmasi Pembayaran Cash</span>
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  // Function untuk cache busting
  const getImageWithCacheBust = (url) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}timestamp=${Date.now()}`;
  };

  // Refresh images
  const refreshImages = () => {
    setImageRefreshKey(prev => prev + 1);
  };

  // tolak jika bukan admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/home');
    }
  }, [user, isAdmin, navigate]);

const handleOrderAction = async () => {
  try {
    console.log('🔄 ===== START ORDER ACTION =====');
    console.log('🔹 Action Type:', actionType);

    if (actionType === 'accept') {
      await acceptOrder(selectedOrder.id, adminNotes);
      
    } else if (actionType === 'reject') {
      await rejectOrder(selectedOrder.id, adminNotes);
      
    } else if (actionType === 'deliver') {
      await addDeliveryFiles(selectedOrder.id, deliveryFiles.filter(file => file.url && file.name));
      
    } else if (actionType === 'confirm-payment') {
      // PERBAIKAN: Kirim adminNotes ke confirmPayment
      await confirmPayment(selectedOrder.id, adminNotes);
      
      // Tampilkan pesan khusus untuk konfirmasi pembayaran
      const paymentMethod = selectedOrder.paymentMethod;
      if (paymentMethod === 'qris') {
        alert('✅ Pembayaran QRIS berhasil dikonfirmasi! Status order akan diperbarui.');
      } else if (paymentMethod === 'cash') {
        alert('✅ Pembayaran Cash berhasil dikonfirmasi! Status order akan diperbarui.');
      }
      
    } else if (actionType === 'complete') {
      await completeOrder(selectedOrder.id, adminNotes);
      alert('✅ Pesanan berhasil diselesaikan!');
    }

    console.log('✅ ===== ORDER ACTION SUCCESS =====');

    // Close modal
    setShowOrderModal(false);
    setSelectedOrder(null);
    setAdminNotes('');
    setDeliveryFiles([{ name: '', url: '', type: '' }]);

  } catch (error) {
    console.error('❌ ===== ORDER ACTION FAILED =====');
    console.error('❌ Error:', error);
    alert('❌ Gagal: ' + (error.message || 'Terjadi kesalahan'));
  }
};
  const addDeliveryFileField = () => {
    setDeliveryFiles([...deliveryFiles, { name: '', url: '', type: '' }]);
  };

  const updateDeliveryFile = (index, field, value) => {
    const updatedFiles = [...deliveryFiles];
    updatedFiles[index][field] = value;
    setDeliveryFiles(updatedFiles);
  };

  // Product functions
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Harap pilih file gambar (JPG, PNG, JPEG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Ukuran gambar maksimal 5MB');
        return;
      }
      setImageFile(file);
      setFormError('');
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setNewProduct(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setUploadLoading(true);
      setFormError('');

      if (!newProduct.title || !newProduct.price || !newProduct.category) {
        setFormError('Harap isi semua field yang wajib');
        return;
      }

      const productData = {
        title: newProduct.title,
        subtitle: newProduct.subtitle,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image: newProduct.image,
        stock: 10,
        status: 'Active'
      };

      await addProduct(productData, imageFile);
      
      setNewProduct({ title: '', subtitle: '', price: '', category: '', image: '' });
      setImageFile(null);
      setImagePreview('');
      setShowAddModal(false);
      setFormError('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        refreshImages();
      }, 1000);

    } catch (error) {
      console.error('Error adding product:', error);
      setFormError('Gagal menambahkan produk: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(productId);
        setTimeout(() => {
          refreshImages();
        }, 500);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk: ' + (error.message || 'Terjadi kesalahan'));
      }
    }
  };

  // Format utilities
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  // Order status functions
  const getStatusColor = (status, paymentStatus) => {
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'accepted') return 'bg-blue-100 text-blue-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (paymentStatus === 'paid') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status, paymentStatus) => {
    if (status === 'rejected') return 'Ditolak';
    if (status === 'completed') return 'Selesai';
    if (status === 'accepted') return paymentStatus === 'paid' ? 'Diproses' : 'Menunggu Pembayaran';
    if (status === 'pending') return 'Menunggu Konfirmasi';
    if (paymentStatus === 'paid') return 'Sudah Bayar';
    return 'Pending';
  };

  // Data configurations
  const stats = [
    {
      title: 'Total Pendapatan',
      value: formatCurrency(orderStats.totalRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: FaDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Produk',
      value: formatNumber(dashboardData?.totalProducts || products?.length || 0),
      change: '+5.2%',
      trend: 'up',
      icon: FaShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pelanggan',
      value: formatNumber(orderStats.uniqueCustomers),
      change: '+8.1%',
      trend: 'up',
      icon: FaUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Pesanan',
      value: formatNumber(orderStats.totalOrders),
      change: '+15.3%',
      trend: 'up',
      icon: FaShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const quickActions = [
    {
      label: 'Tambah Produk Baru',
      icon: FaPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => setShowAddModal(true)
    },
    {
      label: 'Kelola Pesanan',
      icon: FaShoppingCart,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => setActiveOrderTab('pending')
    },
    {
      label: 'Generate Laporan',
      icon: FaChartLine,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/admin/reports')
    },
    {
      label: 'System Settings',
      icon: FaCog,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => navigate('/admin/settings')
    }
  ];

  // Error state
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBell className="text-red-600 text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{dashboardError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  // Non-admin access
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Anda tidak memiliki akses ke halaman admin.</p>
          <button 
            onClick={() => navigate('/home')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-600 hidden sm:block">SolveSmart Admin</p>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                Admin
              </span>
              
              <button 
                onClick={refreshImages}
                className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors"
                title="Refresh Images"
              >
                <FaRedo className="text-green-600 text-sm" />
              </button>

              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors relative">
                <FaBell className="text-gray-600 text-sm" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1 border border-gray-200 shadow-sm hover:shadow transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">
                    {user?.displayName || user?.email}
                  </p>
                </div>
                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                <FaSignOutAlt className="text-xs" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Selamat Datang, Admin! 👋
              </h1>
              <p className="text-gray-600">
                Dashboard Real-time SolveSmart
              </p>
            </div>
            <button
              onClick={refreshImages}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaRedo className="text-sm" />
              <span className="text-sm">Refresh Images</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <IconComponent className={`text-lg ${stat.color}`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`w-full ${action.color} text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-between`}
                    >
                      <span className="text-sm">{action.label}</span>
                      <IconComponent className="text-sm" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Produk Terbaru</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={refreshImages}
                    className="text-green-500 hover:text-green-600 text-sm font-medium flex items-center gap-1"
                    title="Refresh Images"
                  >
                    <FaRedo className="text-xs" />
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                  >
                    <FaPlus className="text-xs" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
              
              {productsLoading ? (
                <div className="text-center py-6">
                  <FaSpinner className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Memuat produk...</p>
                </div>
              ) : !products || products.length === 0 ? (
                <div className="text-center py-8">
                  <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-2">Belum ada produk</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Tambah Produk
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative">
                          <img 
                            src={getImageWithCacheBust(convertDriveLink(product.image))}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              console.log('❌ Image failed to load:', product.image);
                              e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                            }}
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate text-sm">{product.title}</h3>
                          <p className="text-gray-600 text-xs truncate">{product.subtitle}</p>
                          <p className="text-gray-500 text-xs">Rp {product.price?.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                        <button className="w-7 h-7 bg-blue-100 text-blue-600 rounded flex items-center justify-center hover:bg-blue-200 transition-colors">
                          <FaEdit className="text-xs" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={actionLoading}
                          className="w-7 h-7 bg-red-100 text-red-600 rounded flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Management Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Kelola Pesanan</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Total: {orders?.length || 0} pesanan
              </span>
            </div>
          </div>

          {/* Order Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {[
              { key: 'pending', label: 'Menunggu', count: pendingOrders.length, color: 'bg-yellow-500' },
              { key: 'accepted', label: 'Diterima', count: acceptedOrders.length, color: 'bg-blue-500' },
              { key: 'completed', label: 'Selesai', count: completedOrders.length, color: 'bg-green-500' },
              { key: 'rejected', label: 'Ditolak', count: rejectedOrders.length, color: 'bg-red-500' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveOrderTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeOrderTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${tab.color}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {(activeOrderTab === 'pending' ? pendingOrders :
              activeOrderTab === 'accepted' ? acceptedOrders :
              activeOrderTab === 'completed' ? completedOrders : rejectedOrders
            ).map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id?.slice(-8).toUpperCase() || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.userName || 'Unknown'} • {order.userEmail || 'No email'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-sm text-gray-600">
                          {order.createdAt?.toLocaleDateString?.('id-ID') || 'Unknown date'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className={`font-semibold ${
                          order.status === 'rejected' ? 'text-red-600' :
                          order.status === 'completed' ? 'text-green-600' :
                          order.status === 'accepted' ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          {getStatusText(order.status, order.paymentStatus)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pembayaran</p>
                        <p className={`font-semibold ${
                          order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Lunas' : 'Belum Bayar'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Metode</p>
                        <div className="flex items-center space-x-1">
                          {order.paymentMethod === 'qris' ? (
                            <FaQrcode className="text-green-500 text-sm" />
                          ) : order.paymentMethod === 'cash' ? (
                            <FaMoneyBillWave className="text-blue-500 text-sm" />
                          ) : (
                            <FiCreditCard className="text-gray-500 text-sm" />
                          )}
                          <p className="font-semibold text-gray-900 capitalize">
                            {order.paymentMethod || '-'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Items</p>
                        <p className="font-semibold text-gray-900">{order.items?.length || 0}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    {renderPaymentInfo(order)}

                    {order.adminNotes && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          <strong>Catatan Admin:</strong> {order.adminNotes}
                        </p>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="border-t pt-3">
                      <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <img 
                              src={convertDriveLink(item.image)} 
                              alt={item.title}
                              className="w-10 h-10 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-gray-600">
                                {formatCurrency(item.price)} x {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Files */}
                    {order.deliveryFiles && order.deliveryFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">File Pengiriman:</p>
                        <div className="space-y-1">
                          {order.deliveryFiles.map((file, index) => (
                            <a
                              key={index}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <FiDownload className="w-4 h-4" />
                              <span>{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 min-w-[200px]">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('accept');
                            setShowOrderModal(true);
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                        >
                          <FiCheck className="w-4 h-4" />
                          <span>Terima</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('reject');
                            setShowOrderModal(true);
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                        >
                          <FiX className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </>
                    )}

                    {order.status === 'accepted' && order.paymentStatus === 'paid' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('deliver');
                            setShowOrderModal(true);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          <span>Kirim File</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('complete');
                            setShowOrderModal(true);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <FaCheck className="w-4 h-4" />
                          <span>Selesaikan</span>
                        </button>
                      </>
                    )}

                    {/* Tombol konfirmasi pembayaran untuk QRIS dan Cash yang belum bayar */}
                    {order.status === 'accepted' && order.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType('confirm-payment');
                          setShowOrderModal(true);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <FiDollarSign className="w-4 h-4" />
                        <span>
                          Konfirmasi {order.paymentMethod === 'qris' ? 'QRIS' : 'Cash'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowNoteModal(true);
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
                    >
                      <FaStickyNote className="w-4 h-4" />
                      <span>Lihat Catatan</span>
                    </button>

                    {/* MODAL CATATAN - TAMPILAN RAPI */}
                    {showNoteModal && selectedOrder && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md border border-cyan-500/30 shadow-2xl relative">
                          
                          {/* Header dengan gradient */}
                          <div className="flex justify-between items-center mb-6 pb-4 border-b border-cyan-500/20">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                <FaStickyNote className="w-4 h-4 text-cyan-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">Catatan Pembeli</h3>
                                <p className="text-cyan-400 text-xs">Order #{selectedOrder.id?.slice(-8)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Container Catatan */}
                          <div className="space-y-4">
                            {/* Nama Pembeli */}
                            <div>
                              <label className="block text-cyan-300 text-sm font-medium mb-2">
                                Nama Pembeli
                              </label>
                              <div className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/20 rounded-xl text-white font-medium">
                                {selectedOrder.shippingAddress?.fullName || "Tidak tersedia"}
                              </div>
                            </div>

                            {/* Catatan Tambahan */}
                            <div>
                              <label className="block text-cyan-300 text-sm font-medium mb-2">
                                Catatan Tambahan
                              </label>
                              <div className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/20 rounded-xl min-h-[120px]">
                                {selectedOrder.shippingAddress?.note ? (
                                  <p className="text-white whitespace-pre-wrap leading-relaxed text-sm">
                                    {selectedOrder.shippingAddress.note}
                                  </p>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <FaStickyNote className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm italic">Tidak ada catatan tambahan</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Tombol Tutup */}
                          <button
                            onClick={() => setShowNoteModal(false)}
                            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20"
                          >
                            Tutup
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))}

            {(activeOrderTab === 'pending' && pendingOrders.length === 0) ||
             (activeOrderTab === 'accepted' && acceptedOrders.length === 0) ||
             (activeOrderTab === 'completed' && completedOrders.length === 0) ||
             (activeOrderTab === 'rejected' && rejectedOrders.length === 0) ? (
              <div className="text-center py-8">
                <FiPackage className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Tidak ada pesanan {activeOrderTab}</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tambah Produk Baru</h3>
            
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Image Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gambar Produk
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDriveHelp(!showDriveHelp)}
                    className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1"
                  >
                    <FaInfoCircle className="text-xs" />
                    Cara pakai Google Drive
                  </button>
                </div>

                {showDriveHelp && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs">
                    <p className="font-semibold text-blue-800 mb-2">Cara pakai Google Drive:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Upload gambar ke Google Drive</li>
                      <li>Klik kanan → "Get link"</li>
                      <li>Set sharing ke "Anyone with the link"</li>
                      <li>Copy link dan paste di bawah</li>
                    </ol>
                  </div>
                )}
                
                {imagePreview ? (
                  <div className="relative mb-3">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <FaUpload className="text-gray-400 text-2xl mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Klik untuk upload gambar</p>
                    <p className="text-gray-400 text-xs">PNG, JPG, JPEG (max. 5MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    Atau masukkan URL gambar:
                  </label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="https://drive.google.com/uc?export=view&id=FILE_ID"
                  />
                </div>
              </div>

              {/* Form fields lainnya */}
              {[
                { label: 'Nama Produk *', key: 'title', type: 'text', placeholder: 'Masukkan nama produk' },
                { label: 'Deskripsi', key: 'subtitle', type: 'text', placeholder: 'Masukkan deskripsi produk' },
                { label: 'Harga *', key: 'price', type: 'number', placeholder: 'Masukkan harga' },
                { label: 'Kategori *', key: 'category', type: 'text', placeholder: 'Masukkan kategori' }
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={newProduct[field.key]}
                    onChange={(e) => setNewProduct({...newProduct, [field.key]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={field.placeholder}
                    required={field.label.includes('*')}
                  />
                </div>
              ))}
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    handleRemoveImage();
                    setFormError('');
                    setShowDriveHelp(false);
                  }}
                  disabled={uploadLoading}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm flex items-center justify-center"
                >
                  {uploadLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Tambah Produk'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Action Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionType === 'accept' && 'Terima Pesanan'}
              {actionType === 'reject' && 'Tolak Pesanan'}
              {actionType === 'deliver' && 'Kirim File Pesanan'}
              {actionType === 'confirm-payment' && 'Konfirmasi Pembayaran'}
              {actionType === 'complete' && 'Selesaikan Pesanan'}
              {actionType === 'view' && 'Detail Pesanan'}
            </h3>

            {actionType !== 'view' && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Order: <strong>#{selectedOrder.id?.slice(-8).toUpperCase() || 'N/A'}</strong>
                </p>
                <p className="text-sm text-blue-800">
                  Customer: <strong>{selectedOrder.userName || 'Unknown'}</strong>
                </p>
                <p className="text-sm text-blue-800">
                  Total: <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                </p>
                <p className="text-sm text-blue-800">
                  Status: <strong>{getStatusText(selectedOrder.status, selectedOrder.paymentStatus)}</strong>
                </p>
                <p className="text-sm text-blue-800">
                  Pembayaran: <strong>{selectedOrder.paymentStatus === 'paid' ? 'Lunas' : 'Belum Bayar'} ({selectedOrder.paymentMethod})</strong>
                </p>
              </div>
            )}

            {/* Admin Notes Input */}
            {(actionType === 'accept' || actionType === 'reject' || actionType === 'complete') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'complete' ? 'Catatan Penyelesaian' : 'Catatan untuk Customer'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows="3"
                  placeholder={
                    actionType === 'complete' 
                      ? 'Masukkan catatan penyelesaian order...' 
                      : 'Masukkan catatan untuk customer...'
                  }
                />
              </div>
            )}

            {/* Konfirmasi Complete Order */}
            {actionType === 'complete' && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCheck className="text-yellow-600 text-lg" />
                  <h4 className="font-semibold text-yellow-800">Selesaikan Pesanan</h4>
                </div>
                <p className="text-yellow-700 text-sm">
                  Apakah Anda yakin ingin menyelesaikan pesanan ini? 
                  Pastikan semua file sudah dikirim dan customer sudah menerima produk.
                </p>
              </div>
            )}

            {/* Delivery Files Input */}
            {actionType === 'deliver' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Pengiriman (PDF/Google Drive Links)
                </label>
                {deliveryFiles.map((file, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nama file"
                      value={file.name}
                      onChange={(e) => updateDeliveryFile(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="url"
                      placeholder="URL file"
                      value={file.url}
                      onChange={(e) => updateDeliveryFile(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDeliveryFileField}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Tambah File Lain</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                  setAdminNotes('');
                  setDeliveryFiles([{ name: '', url: '', type: '' }]);
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              
              {actionType !== 'view' && (
                <button
                  onClick={handleOrderAction}
                  disabled={orderActionLoading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {orderActionLoading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Konfirmasi</span>
                      <FiCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;