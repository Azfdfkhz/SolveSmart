// pages/ProductDetail.jsx (COMPLETE VERSION dengan Real Payment Processing)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';
import Navbar from '../components/Navbar';
import { 
  FiArrowLeft, 
  FiShoppingCart, 
  FiHeart, 
  FiShare2, 
  FiStar,
  FiCheck,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiDollarSign
} from 'react-icons/fi';
import { FaQrcode, FaSpinner, FaTimesCircle } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, addToCart, loading } = useProduct();
  const { createOrder, processPayment, actionLoading } = useOrder(); // TAMBAH processPayment di sini
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Cari product berdasarkan ID
  useEffect(() => {
    if (products.length > 0 && id) {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [products, id]);

  // Fungsi untuk show toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: quantity
    });
    showToast('Produk ditambahkan ke keranjang! 🛒');
  };

  const handleBuyNow = () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk membeli', 'error');
      navigate('/login');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleCheckout = async () => {
    try {
      // Validasi alamat pengiriman
      if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
        showToast('Harap isi data pengiriman dengan lengkap', 'error');
        return;
      }

      // Buat order data
      const orderData = {
        items: [{
          productId: product.id,
          title: product.title,
          subtitle: product.subtitle,
          price: product.price,
          image: product.image,
          quantity: quantity,
          category: product.category
        }],
        shippingAddress: shippingAddress,
        notes: `Pembelian langsung: ${product.title}`
      };

      // Create order
      const order = await createOrder(orderData);
      
      // Simpan order yang baru dibuat dan tampilkan modal pembayaran
      setCreatedOrder(order);
      setShowCheckoutModal(false);
      setShowPaymentModal(true);
      showToast('Pesanan berhasil dibuat! Silakan lanjutkan pembayaran.');
      
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Gagal membuat pesanan: ' + error.message, 'error');
    }
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      showToast('Pilih metode pembayaran terlebih dahulu', 'error');
      return;
    }

    if (selectedPaymentMethod === 'qris') {
      setShowQRCode(true);
    } else {
      handleCashPayment();
    }
  };

  const handleCashPayment = async () => {
    try {
      setProcessingPayment(true);
      showToast('🔄 Memproses pembayaran cash...', 'info');
      
      // PANGGIL FUNGSI processPayment YANG SEBENARNYA
      if (createdOrder && createdOrder.id) {
        console.log('🎯 Processing CASH payment for order:', createdOrder.id);
        await processPayment(createdOrder.id, 'cash');
        console.log('✅ CASH payment processed successfully');
      } else {
        throw new Error('Order tidak ditemukan');
      }
      
      setShowPaymentModal(false);
      setCreatedOrder(null);
      setSelectedPaymentMethod('');
      setProcessingPayment(false);
      
      showToast('✅ Pembayaran cash berhasil! Redirect ke home...');
      
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error in CASH payment:', error);
      setProcessingPayment(false);
      showToast('❌ Gagal memproses pembayaran: ' + error.message, 'error');
    }
  };

  const handleQRISPayment = async () => {
    try {
      setProcessingPayment(true);
      showToast('🔄 Memproses pembayaran QRIS...', 'info');
      
      // PANGGIL FUNGSI processPayment YANG SEBENARNYA
      if (createdOrder && createdOrder.id) {
        console.log('🎯 Processing QRIS payment for order:', createdOrder.id);
        await processPayment(createdOrder.id, 'qris');
        console.log('✅ QRIS payment processed successfully');
      } else {
        throw new Error('Order tidak ditemukan');
      }
      
      // Tutup modal dengan animasi bertahap
      setShowQRCode(false);
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowPaymentModal(false);
      
      // Reset state
      setCreatedOrder(null);
      setSelectedPaymentMethod('');
      setProcessingPayment(false);
      
      showToast('✅ Pembayaran QRIS berhasil! Tunggu konfirmasi admin.');
      
      // Redirect dengan delay yang pas
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error in QRIS payment:', error);
      setProcessingPayment(false);
      showToast('❌ Gagal memproses pembayaran: ' + error.message, 'error');
    }
  };

  const generateQRCode = (orderId, amount) => {
    const qrData = `QRIS:ORDER-${orderId}:AMOUNT-${amount}:TIMESTAMP-${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="text-white text-xl mb-4">Product tidak ditemukan</div>
          <button 
            onClick={() => navigate('/home')}
            className="text-blue-300 hover:text-white px-4 py-2 border border-blue-500/30 rounded-lg"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  // Mock product images
  const productImages = [
    product.image,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          toast.type === 'error' 
            ? 'bg-red-100 border-red-500 text-red-700' 
            : toast.type === 'info'
            ? 'bg-blue-100 border-blue-500 text-blue-700'
            : 'bg-green-100 border-green-500 text-green-700'
        } transition-all duration-300 transform translate-x-0`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'error' ? (
              <FaTimesCircle className="text-red-500 text-lg" />
            ) : toast.type === 'info' ? (
              <FaSpinner className="text-blue-500 text-lg animate-spin" />
            ) : (
              <FiCheck className="text-green-500 text-lg" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Back Button - Mobile & Desktop */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 sm:space-x-3 text-blue-300 hover:text-white mb-4 sm:mb-8 transition-all duration-300 w-full sm:w-auto"
        >
          <div className="p-2 bg-blue-800/40 rounded-xl border border-blue-700/30">
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-medium text-sm sm:text-base">Kembali</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Product Images - Mobile First */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-gradient-to-br from-blue-800/30 to-cyan-800/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-700/30">
              <img
                src={productImages[selectedImage]}
                alt={product.title}
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl sm:rounded-2xl"
              />
            </div>
            
            {/* Thumbnails - Scrollable on mobile */}
            <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-cyan-400 shadow-lg shadow-cyan-500/30' 
                      : 'border-blue-600/30 hover:border-cyan-400/50'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Header */}
            <div className="bg-gradient-to-br from-blue-800/20 to-purple-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-700/30">
              {/* Category & Rating - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-cyan-500/20 px-2 sm:px-3 py-1 rounded-full border border-cyan-400/30">
                    <span className="text-cyan-400 text-xs sm:text-sm">{product.category || 'Template'}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-400">
                    <FiStar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">4.8</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-lg sm:rounded-xl border transition-all ${
                      isFavorite 
                        ? 'bg-red-500/20 border-red-400/30 text-red-400' 
                        : 'bg-blue-800/40 border-blue-700/30 text-blue-300 hover:bg-red-500/20'
                    }`}
                  >
                    <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button className="p-2 bg-blue-800/40 border border-blue-700/30 text-blue-300 rounded-lg sm:rounded-xl hover:bg-cyan-500/20 transition-all">
                    <FiShare2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              
              {/* Product Title & Subtitle */}
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {product.title}
              </h1>
              
              <p className="text-blue-200 text-sm sm:text-base mb-4 line-clamp-2">
                {product.subtitle || "Template premium berkualitas tinggi"}
              </p>

              {/* Price */}
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4 sm:mb-6">
                Rp {product.price?.toLocaleString()}
              </div>

              {/* Quantity & CTA */}
              <div className="space-y-3 sm:space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm sm:text-base">Quantity:</span>
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-blue-900/30 rounded-lg sm:rounded-xl p-2 border border-blue-700/30">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-800 rounded sm:rounded-lg text-white hover:bg-blue-700 transition-colors text-sm"
                    >
                      -
                    </button>
                    <span className="text-white font-semibold w-6 sm:w-8 text-center text-sm sm:text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-800 rounded sm:rounded-lg text-white hover:bg-blue-700 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CTA Buttons - Stack on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    <span>Keranjang</span>
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all text-sm sm:text-base"
                  >
                    Beli Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-blue-700/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Checkout</h3>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="text-blue-300 hover:text-white"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-700/30 mb-6">
              <h4 className="font-semibold text-white mb-3">Ringkasan Pesanan</h4>
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{product.title}</p>
                  <p className="text-blue-300 text-xs">
                    Rp {product.price?.toLocaleString()} x {quantity}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-blue-700/30">
                <span className="text-white font-semibold">Total</span>
                <span className="text-cyan-400 font-bold text-lg">
                  Rp {(product.price * quantity)?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Shipping Address Form */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white mb-3">Alamat Pengiriman</h4>
              
              <div>
                <label className="block text-blue-300 text-sm mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm mb-2">Nomor Telepon *</label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Masukkan nomor telepon"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm mb-2">Alamat Lengkap *</label>
                <textarea
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-300 text-sm mb-2">Kota</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Kota"
                  />
                </div>
                <div>
                  <label className="block text-blue-300 text-sm mb-2">Kode Pos</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Kode Pos"
                  />
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all mt-6 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {actionLoading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Lanjut ke Pembayaran</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && createdOrder && !showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md border border-blue-700/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Pilih Metode Pembayaran</h3>
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setCreatedOrder(null);
                }}
                className="text-blue-300 hover:text-white"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Order Info */}
            <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-700/30 mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300">Total Pembayaran</p>
                <p className="text-xl font-bold text-cyan-400">
                  {formatCurrency(createdOrder.totalAmount)}
                </p>
              </div>
              <p className="text-xs text-blue-300">Order ID: #{createdOrder.id?.slice(-8).toUpperCase()}</p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
              {/* QRIS Option */}
              <div 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'qris' ? 'border-cyan-500 bg-cyan-500/10' : 'border-blue-700/30 hover:border-cyan-400'
                }`}
                onClick={() => setSelectedPaymentMethod('qris')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <FaQrcode className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">QRIS</p>
                    <p className="text-sm text-blue-300">Bayar dengan scan QR Code</p>
                  </div>
                  {selectedPaymentMethod === 'qris' && (
                    <FiCheck className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
              </div>

              {/* Cash Option */}
              <div 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'cash' ? 'border-green-500 bg-green-500/10' : 'border-blue-700/30 hover:border-green-400'
                }`}
                onClick={() => setSelectedPaymentMethod('cash')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Cash</p>
                    <p className="text-sm text-blue-300">Bayar dengan tunai</p>
                  </div>
                  {selectedPaymentMethod === 'cash' && (
                    <FiCheck className="w-5 h-5 text-green-400" />
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={!selectedPaymentMethod || processingPayment}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {processingPayment ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FiCreditCard className="w-4 h-4" />
                  <span>Bayar Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showPaymentModal && createdOrder && showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md border border-blue-700/30">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Scan QR Code</h3>
            
            <div className="text-center mb-4">
              <p className="text-blue-300 mb-2">Scan QR code berikut untuk pembayaran</p>
              <p className="text-sm text-blue-400">Order ID: #{createdOrder.id?.slice(-8).toUpperCase()}</p>
            </div>

            {/* QR Code Display */}
            <div className="flex justify-center mb-4">
              <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-4 bg-white">
                <img 
                  src={generateQRCode(createdOrder.id, createdOrder.totalAmount)}
                  alt="QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
              <p className="text-sm text-amber-300 text-center">
                <strong>Perhatian:</strong> Setelah pembayaran, klik "Sudah Bayar"
              </p>
            </div>

            <div className="bg-blue-900/20 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total:</span>
                <span className="font-bold text-cyan-400">{formatCurrency(createdOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowQRCode(false)}
                disabled={processingPayment}
                className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                onClick={handleQRISPayment}
                disabled={processingPayment}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {processingPayment ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>Sudah Bayar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Buy Button for Mobile Only */}
      <div className="fixed bottom-4 left-4 right-4 z-20 lg:hidden">
        <button
          onClick={handleBuyNow}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold text-center shadow-2xl w-full text-sm"
        >
          Beli Sekarang - Rp {product.price?.toLocaleString()}
        </button>
      </div>

      {/* Bottom padding for mobile floating button */}
      <div className="h-16 lg:h-0"></div>
    </div>
  );
};

export default ProductDetail;