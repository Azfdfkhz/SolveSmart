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
  FaCheck,
  FaTimesCircle,
  FaFileDownload,
  FaMoneyBillWave,
  FaQrcode,
  FaStickyNote,
  FaSearch,
  FaFilter,
  FaLink,
  FaBars,
  FaTimes as FaTimesIcon
} from 'react-icons/fa';
import { 
  FiPackage, 
  FiCheck, 
  FiX, 
  FiClock,
  FiDownload,
  FiDollarSign,
  FiCreditCard,
  FiBarChart2,
  FiShoppingCart,
  FiUser,
  FiSettings
} from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { products, addProduct, editProduct, deleteProduct, loading: productsLoading, actionLoading } = useProduct();
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
  
  // State management
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState(''); 
  const [adminNotes, setAdminNotes] = useState('');
  const [deliveryFiles, setDeliveryFiles] = useState([{ name: '', url: '', type: '' }]);
  const [activeOrderTab, setActiveOrderTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State untuk multiple images dengan link
  const [imageUrls, setImageUrls] = useState(['', '', '']); // 3 slot untuk URL gambar
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDriveHelp, setShowDriveHelp] = useState(false);

  const [newProduct, setNewProduct] = useState({
    title: '',
    subtitle: '',
    price: '',
    category: '',
    images: []
  });

  // Filter and process data
  const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
  const acceptedOrders = orders?.filter(order => order.status === 'accepted') || [];
  const completedOrders = orders?.filter(order => order.status === 'completed') || [];
  const rejectedOrders = orders?.filter(order => order.status === 'rejected') || [];

  // Filter products based on search and category
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get categories for filter
  const categories = ['all', ...new Set(products?.map(product => product.category).filter(Boolean))];

  const orderStats = getOrderStats ? getOrderStats() : {
    totalOrders: orders?.length || 0,
    pendingOrders: pendingOrders.length,
    acceptedOrders: acceptedOrders.length,
    completedOrders: completedOrders.length,
    totalRevenue: completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    monthlyRevenue: 0,
    uniqueCustomers: new Set(orders?.map(order => order.userEmail)).size || 0
  };

  // Utility functions
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

  const getStatusColor = (status, paymentStatus) => {
    if (status === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'completed') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'accepted') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (paymentStatus === 'paid') return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusText = (status, paymentStatus) => {
    if (status === 'rejected') return 'Ditolak';
    if (status === 'completed') return 'Selesai';
    if (status === 'accepted') return paymentStatus === 'paid' ? 'Diproses' : 'Menunggu Pembayaran';
    if (status === 'pending') return 'Menunggu Konfirmasi';
    if (paymentStatus === 'paid') return 'Sudah Bayar';
    return 'Pending';
  };

  // Navigation guard
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/home');
    }
  }, [user, isAdmin, navigate]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Order action handler
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
        await confirmPayment(selectedOrder.id, adminNotes);
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

  // Product management functions
  const addDeliveryFileField = () => {
    setDeliveryFiles([...deliveryFiles, { name: '', url: '', type: '' }]);
  };

  const updateDeliveryFile = (index, field, value) => {
    const updatedFiles = [...deliveryFiles];
    updatedFiles[index][field] = value;
    setDeliveryFiles(updatedFiles);
  };

  // Handle URL image input
  const handleUrlChange = (index, url) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = url;
    setImageUrls(newImageUrls);

    // Update preview
    if (url.trim()) {
      const newPreviews = [...imagePreviews];
      newPreviews[index] = url;
      setImagePreviews(newPreviews.filter(preview => preview));
    } else {
      const newPreviews = [...imagePreviews];
      delete newPreviews[index];
      setImagePreviews(newPreviews.filter(preview => preview));
    }
  };

  const handleRemoveImage = (index) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = '';
    setImageUrls(newImageUrls);

    const newPreviews = [...imagePreviews];
    delete newPreviews[index];
    setImagePreviews(newPreviews.filter(preview => preview));
  };

  // Handle Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setUploadLoading(true);
      setFormError('');

      if (!newProduct.title || !newProduct.price || !newProduct.category) {
        setFormError('Harap isi semua field yang wajib');
        return;
      }

      // Validasi minimal 1 gambar
      const validImageUrls = imageUrls.filter(url => url.trim() !== '');
      if (validImageUrls.length === 0) {
        setFormError('Harap tambahkan minimal 1 gambar');
        return;
      }

      const productData = {
        title: newProduct.title,
        subtitle: newProduct.subtitle,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        images: validImageUrls, // Gunakan array images dari URL
        stock: 10,
        status: 'Active'
      };

      await addProduct(productData);
      
      resetForm();
      setShowAddModal(false);
      alert('✅ Produk berhasil ditambahkan!');

    } catch (error) {
      console.error('Error adding product:', error);
      setFormError('Gagal menambahkan produk: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle Edit Product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      setUploadLoading(true);
      setFormError('');

      if (!newProduct.title || !newProduct.price || !newProduct.category) {
        setFormError('Harap isi semua field yang wajib');
        return;
      }

      // Validasi minimal 1 gambar
      const validImageUrls = imageUrls.filter(url => url.trim() !== '');
      if (validImageUrls.length === 0) {
        setFormError('Harap tambahkan minimal 1 gambar');
        return;
      }

      const productData = {
        title: newProduct.title,
        subtitle: newProduct.subtitle,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        images: validImageUrls, // Gunakan array images dari URL
        stock: newProduct.stock || 10,
        status: newProduct.status || 'Active'
      };

      await editProduct(selectedProduct.id, productData);
      
      resetForm();
      setShowEditModal(false);
      setSelectedProduct(null);
      alert('✅ Produk berhasil diperbarui!');

    } catch (error) {
      console.error('Error editing product:', error);
      setFormError('Gagal memperbarui produk: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setUploadLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    
    // Handle both old single image and new multiple images format
    const productImages = product.images || (product.image ? [product.image] : []);
    
    // Initialize image URLs
    const initialImageUrls = ['', '', ''];
    productImages.forEach((image, index) => {
      if (index < 3) {
        initialImageUrls[index] = image;
      }
    });

    setNewProduct({
      title: product.title || '',
      subtitle: product.subtitle || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      images: productImages,
      stock: product.stock || 10,
      status: product.status || 'Active'
    });
    
    setImageUrls(initialImageUrls);
    setImagePreviews(productImages);
    setFormError('');
    setShowDriveHelp(false);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(productId);
        alert('✅ Produk berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk: ' + (error.message || 'Terjadi kesalahan'));
      }
    }
  };

  // Reset form when modal closes
  const resetForm = () => {
    setNewProduct({ 
      title: '', 
      subtitle: '', 
      price: '', 
      category: '', 
      images: [] 
    });
    setImageUrls(['', '', '']);
    setImagePreviews([]);
    setFormError('');
    setShowDriveHelp(false);
  };

  // Data configurations
  const stats = [
    {
      title: 'Total Pendapatan',
      value: formatCurrency(orderStats.totalRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: FiBarChart2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Total Produk',
      value: formatNumber(dashboardData?.totalProducts || products?.length || 0),
      change: '+5.2%',
      trend: 'up',
      icon: FaShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pelanggan',
      value: formatNumber(orderStats.uniqueCustomers),
      change: '+8.1%',
      trend: 'up',
      icon: FiUser,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Pesanan',
      value: formatNumber(orderStats.totalOrders),
      change: '+15.3%',
      trend: 'up',
      icon: FiShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const quickActions = [
    {
      label: 'Tambah Produk',
      icon: FaPlus,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      action: () => setShowAddModal(true)
    },
    {
      label: 'Generate Laporan',
      icon: FaChartLine,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      action: () => navigate('/admin/reports')
    },
    {
      label: 'Pengaturan',
      icon: FiSettings,
      color: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
      action: () => navigate('/admin/settings')
    }
  ];

  // Error state
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBell className="text-red-500 text-xl" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-slate-600 mb-6">{dashboardError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  // Non-admin access
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 mb-6">Anda tidak memiliki akses ke halaman admin.</p>
          <button 
            onClick={() => navigate('/home')}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors text-slate-600"
              >
                {isMobileMenuOpen ? <FaTimesIcon className="text-lg" /> : <FaBars className="text-lg" />}
              </button>

              <div className="w-10 h-10 bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                <FiSettings className="text-white text-lg" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 text-xs sm:text-sm">SolveSmart Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-3">
              <button className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors text-slate-600 relative">
                <FaBell className="text-sm" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="w-px h-6 bg-slate-300"></div>

              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 border border-slate-200 shadow-sm hover:shadow transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.displayName || user?.email}
                  </p>
                  <p className="text-xs text-slate-600">Admin</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <FaSignOutAlt className="text-xs" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            {/* Mobile User Info */}
            <div className="flex lg:hidden items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mobile-menu bg-white border-t border-slate-200 px-4 py-3 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.displayName || user?.email}
                  </p>
                  <p className="text-xs text-slate-600">Admin</p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/profile')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
              >
                <FaUser className="text-slate-600 text-sm" />
                <span className="text-sm font-medium text-slate-700">Profile</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
                <FaBell className="text-slate-600 text-sm" />
                <span className="text-sm font-medium text-slate-700">Notifikasi</span>
                <span className="w-2 h-2 bg-red-500 rounded-full ml-auto"></span>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors text-red-600"
              >
                <FaSignOutAlt className="text-sm" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Selamat Datang, Admin! 👋
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Kelola bisnis SolveSmart dengan mudah
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 ${stat.bgColor} rounded-lg sm:rounded-xl`}>
                    <IconComponent className={`text-lg sm:text-xl ${stat.color}`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-xs sm:text-sm font-medium ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Quick Actions */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Quick Actions</h2>
              <div className="space-y-2 sm:space-y-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`w-full ${action.color} text-white px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-[1.02] flex items-center justify-between shadow-sm text-sm sm:text-base`}
                    >
                      <span className="text-xs sm:text-sm font-medium">{action.label}</span>
                      <IconComponent className="text-xs sm:text-sm" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Produk Terbaru</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:flex-none">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm w-full sm:w-48"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Semua Kategori' : category}
                      </option>
                    ))}
                  </select>

                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <FaPlus className="text-xs" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
              
              {productsLoading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-3"></div>
                  <p className="text-slate-600 text-xs sm:text-sm">Memuat produk...</p>
                </div>
              ) : !filteredProducts || filteredProducts.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FaBox className="text-3xl sm:text-4xl text-slate-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4">Belum ada produk</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium"
                  >
                    Tambah Produk Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredProducts.slice(0, 6).map((product) => {
                    // Handle both single image and multiple images
                    const productImages = product.images || (product.image ? [product.image] : []);
                    const mainImage = productImages[0] || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                    
                    return (
                      <div key={product.id} className="flex items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img 
                              src={convertDriveLink(mainImage)}
                              alt={product.title}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg bg-slate-100"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                              }}
                              loading="lazy"
                            />
                            {productImages.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                                +{productImages.length - 1}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 truncate text-xs sm:text-sm">{product.title}</h3>
                            <p className="text-slate-600 text-xs truncate mb-1">{product.subtitle}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs">
                              <p className="text-slate-900 font-medium">Rp {product.price?.toLocaleString('id-ID')}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {product.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button 
                            onClick={() => handleOpenEditModal(product)}
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={actionLoading}
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Management Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Kelola Pesanan</h2>
            <div className="flex items-center space-x-4">
              <span className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                Total: {orders?.length || 0} pesanan
              </span>
            </div>
          </div>

          {/* Order Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-slate-100 rounded-lg sm:rounded-xl p-1 mb-4 sm:mb-6">
            {[
              { key: 'pending', label: 'Menunggu', count: pendingOrders.length, color: 'bg-amber-500' },
              { key: 'accepted', label: 'Diterima', count: acceptedOrders.length, color: 'bg-blue-500' },
              { key: 'completed', label: 'Selesai', count: completedOrders.length, color: 'bg-emerald-500' },
              { key: 'rejected', label: 'Ditolak', count: rejectedOrders.length, color: 'bg-red-500' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveOrderTab(tab.key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none justify-center min-w-[120px] sm:min-w-0 ${
                  activeOrderTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${tab.color} flex-shrink-0`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-3 sm:space-y-4">
            {(activeOrderTab === 'pending' ? pendingOrders :
              activeOrderTab === 'accepted' ? acceptedOrders :
              activeOrderTab === 'completed' ? completedOrders : rejectedOrders
            ).map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base sm:text-lg">
                          Order #{order.id?.slice(-8).toUpperCase() || 'N/A'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          {order.userName || 'Unknown'} • {order.userEmail || 'No email'}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-slate-900 text-base sm:text-lg">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs sm:text-sm text-slate-600">
                          {order.createdAt?.toLocaleDateString?.('id-ID') || 'Unknown date'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                      <div>
                        <p className="text-slate-600 text-xs font-medium mb-1">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status, order.paymentStatus)}`}>
                          {getStatusText(order.status, order.paymentStatus)}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs font-medium mb-1">Pembayaran</p>
                        <p className={`font-semibold ${
                          order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Lunas' : 'Belum Bayar'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs font-medium mb-1">Metode</p>
                        <div className="flex items-center space-x-2">
                          {order.paymentMethod === 'qris' ? (
                            <FaQrcode className="text-emerald-500 text-sm sm:text-base" />
                          ) : order.paymentMethod === 'cash' ? (
                            <FaMoneyBillWave className="text-blue-500 text-sm sm:text-base" />
                          ) : (
                            <FiCreditCard className="text-slate-500 text-sm sm:text-base" />
                          )}
                          <p className="font-semibold text-slate-900 capitalize text-xs sm:text-sm">
                            {order.paymentMethod || '-'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs font-medium mb-1">Items</p>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm">{order.items?.length || 0}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-slate-200 pt-3 sm:pt-4">
                      <h4 className="font-medium text-slate-900 text-xs sm:text-sm mb-2 sm:mb-3">Items:</h4>
                      <div className="space-y-2 sm:space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                            <img 
                              src={convertDriveLink(item.image)} 
                              alt={item.title}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 text-xs sm:text-sm truncate">{item.title}</p>
                              <p className="text-slate-600 text-xs">
                                {formatCurrency(item.price)} x {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 min-w-[200px] mt-4 sm:mt-0">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('accept');
                            setShowOrderModal(true);
                          }}
                          className="flex-1 bg-emerald-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 font-medium text-xs sm:text-sm"
                        >
                          <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Terima</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('reject');
                            setShowOrderModal(true);
                          }}
                          className="flex-1 bg-red-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 font-medium text-xs sm:text-sm"
                        >
                          <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
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
                          className="flex-1 bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 font-medium text-xs sm:text-sm"
                        >
                          <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Kirim File</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActionType('complete');
                            setShowOrderModal(true);
                          }}
                          className="flex-1 bg-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 font-medium text-xs sm:text-sm"
                        >
                          <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Selesaikan</span>
                        </button>
                      </>
                    )}

                    {order.status === 'accepted' && order.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType('confirm-payment');
                          setShowOrderModal(true);
                        }}
                        className="flex-1 bg-emerald-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 font-medium text-xs sm:text-sm"
                      >
                        <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">
                          Konfirmasi {order.paymentMethod === 'qris' ? 'QRIS' : 'Cash'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowNoteModal(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all flex items-center justify-center space-x-2 font-medium text-xs sm:text-sm"
                    >
                      <FaStickyNote className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Lihat Catatan</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(activeOrderTab === 'pending' && pendingOrders.length === 0) ||
             (activeOrderTab === 'accepted' && acceptedOrders.length === 0) ||
             (activeOrderTab === 'completed' && completedOrders.length === 0) ||
             (activeOrderTab === 'rejected' && rejectedOrders.length === 0) ? (
              <div className="text-center py-8 sm:py-12">
                <FiPackage className="text-3xl sm:text-4xl text-slate-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-slate-500 text-xs sm:text-sm">Tidak ada pesanan {activeOrderTab}</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Add Product Modal dengan 3 URL Input */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Tambah Produk Baru</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors text-slate-600"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg sm:rounded-xl mb-3 sm:mb-4 text-xs sm:text-sm">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleAddProduct} className="space-y-4 sm:space-y-5">
              {/* Multiple URL Image Input Section */}
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Gambar Produk (Maksimal 3 URL)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDriveHelp(!showDriveHelp)}
                    className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1 font-medium"
                  >
                    <FaInfoCircle className="text-xs" />
                    Cara Upload
                  </button>
                </div>

                {showDriveHelp && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                    <p className="font-semibold text-blue-800 mb-1 sm:mb-2">Cara Upload Gambar</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Upload gambar ke repository GitHub</li>
                      <li>Klik kanan gambar → "Copy image address"</li>
                      <li>Paste link di field URL di bawah</li>
                      <li>Bisa menambahkan hingga 3 gambar</li>
                    </ol>
                  </div>
                )}
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-dashed border-slate-300"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                          Gambar {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL Input Fields */}
                <div className="space-y-2 sm:space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs sm:text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="url"
                          placeholder={`URL gambar ${index + 1}`}
                          value={imageUrls[index]}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          className="flex-1 px-2 sm:px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                        />
                        {imageUrls[index] && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  * Masukkan URL gambar untuk produk. Bisa menambahkan hingga 3 gambar.
                </p>
              </div>

              {/* Form fields */}
              {[
                { label: 'Nama Produk *', key: 'title', type: 'text', placeholder: 'Masukkan nama produk' },
                { label: 'Deskripsi', key: 'subtitle', type: 'text', placeholder: 'Masukkan deskripsi produk' },
                { label: 'Harga *', key: 'price', type: 'number', placeholder: 'Masukkan harga' },
                { label: 'Kategori *', key: 'category', type: 'text', placeholder: 'Masukkan kategori' }
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={newProduct[field.key]}
                    onChange={(e) => setNewProduct({...newProduct, [field.key]: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={field.placeholder}
                    required={field.label.includes('*')}
                  />
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={uploadLoading}
                  className="flex-1 bg-slate-500 text-white py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl hover:bg-slate-600 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 bg-blue-500 text-white py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  {uploadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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

      {/* Edit Product Modal dengan 3 URL Input */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Edit Produk</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  resetForm();
                }}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors text-slate-600"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg sm:rounded-xl mb-3 sm:mb-4 text-xs sm:text-sm">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleEditProduct} className="space-y-4 sm:space-y-5">
              {/* Multiple URL Image Input Section */}
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Gambar Produk (Maksimal 3 URL)
                  </label>
                  <span className="text-xs text-slate-500">
                    {imagePreviews.length}/3 gambar
                  </span>
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-dashed border-slate-300"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                          Gambar {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL Input Fields */}
                <div className="space-y-2 sm:space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs sm:text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="url"
                          placeholder={`URL gambar ${index + 1}`}
                          value={imageUrls[index]}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          className="flex-1 px-2 sm:px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                        />
                        {imageUrls[index] && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form fields */}
              {[
                { label: 'Nama Produk *', key: 'title', type: 'text', placeholder: 'Masukkan nama produk' },
                { label: 'Deskripsi', key: 'subtitle', type: 'text', placeholder: 'Masukkan deskripsi produk' },
                { label: 'Harga *', key: 'price', type: 'number', placeholder: 'Masukkan harga' },
                { label: 'Kategori *', key: 'category', type: 'text', placeholder: 'Masukkan kategori' },
                { label: 'Stok *', key: 'stock', type: 'number', placeholder: 'Masukkan stok' }
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={newProduct[field.key]}
                    onChange={(e) => setNewProduct({...newProduct, [field.key]: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={field.placeholder}
                    required={field.label.includes('*')}
                  />
                </div>
              ))}

              {/* Status Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Status *
                </label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                    resetForm();
                  }}
                  disabled={uploadLoading}
                  className="flex-1 bg-slate-500 text-white py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl hover:bg-slate-600 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex-1 bg-emerald-500 text-white py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  {uploadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Memperbarui...
                    </>
                  ) : (
                    'Perbarui Produk'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Action Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {actionType === 'accept' && 'Terima Pesanan'}
                {actionType === 'reject' && 'Tolak Pesanan'}
                {actionType === 'deliver' && 'Kirim File Pesanan'}
                {actionType === 'confirm-payment' && 'Konfirmasi Pembayaran'}
                {actionType === 'complete' && 'Selesaikan Pesanan'}
              </h3>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                  setAdminNotes('');
                  setDeliveryFiles([{ name: '', url: '', type: '' }]);
                }}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors text-slate-600"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
              <p className="text-xs sm:text-sm text-slate-700 mb-1">
                <span className="font-medium">Order:</span> #{selectedOrder.id?.slice(-8).toUpperCase() || 'N/A'}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 mb-1">
                <span className="font-medium">Customer:</span> {selectedOrder.userName || 'Unknown'}
              </p>
              <p className="text-xs sm:text-sm text-slate-700">
                <span className="font-medium">Total:</span> {formatCurrency(selectedOrder.totalAmount)}
              </p>
            </div>

            {/* Admin Notes Input */}
            {(actionType === 'accept' || actionType === 'reject' || actionType === 'complete') && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                  {actionType === 'complete' ? 'Catatan Penyelesaian' : 'Catatan untuk Customer'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows="3"
                  placeholder={
                    actionType === 'complete' 
                      ? 'Masukkan catatan penyelesaian order...' 
                      : 'Masukkan catatan untuk customer...'
                  }
                />
              </div>
            )}

            {/* Delivery Files Input */}
            {actionType === 'deliver' && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                  File Pengiriman (PDF/Google Drive Links)
                </label>
                {deliveryFiles.map((file, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-2 sm:mb-3">
                    <input
                      type="text"
                      placeholder="Nama file"
                      value={file.name}
                      onChange={(e) => updateDeliveryFile(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <input
                      type="url"
                      placeholder="URL file"
                      value={file.url}
                      onChange={(e) => updateDeliveryFile(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDeliveryFileField}
                  className="text-blue-500 hover:text-blue-600 text-xs sm:text-sm flex items-center space-x-2 font-medium"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Tambah File Lain</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                  setAdminNotes('');
                  setDeliveryFiles([{ name: '', url: '', type: '' }]);
                }}
                className="flex-1 bg-slate-500 text-white py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Batal
              </button>
              
              <button
                onClick={handleOrderAction}
                disabled={orderActionLoading}
                className="flex-1 bg-blue-500 text-white py-2 sm:py-3 px-4 rounded-lg sm:rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2 text-sm"
              >
                {orderActionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Konfirmasi</span>
                    <FiCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Catatan Pembeli</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors text-slate-600"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Nama Pembeli
                </label>
                <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 font-medium text-sm">
                  {selectedOrder.shippingAddress?.fullName || "Tidak tersedia"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Catatan Tambahan
                </label>
                <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl min-h-[100px] sm:min-h-[120px]">
                  {selectedOrder.shippingAddress?.note ? (
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedOrder.shippingAddress.note}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <FaStickyNote className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm italic">Tidak ada catatan tambahan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNoteModal(false)}
              className="w-full mt-4 sm:mt-6 bg-slate-900 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
