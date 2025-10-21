import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiX, 
  FiPlus, 
  FiMinus, 
  FiTrash2, 
  FiArrowRight, 
  FiCheck,
  FiArrowLeft, 
  FiDollarSign, 
  FiCreditCard 
} from 'react-icons/fi';
import { FaSpinner, FaQrcode } from 'react-icons/fa'; 
import QRCodeModal from './QRCodeModal';

const CartSidebar = () => {
  console.log('CartSidebar rendering...');

  const {
    cartItems = [],
    removeFromCart,
    updateQuantity,
    getCartTotal,
    isCartOpen,
    setIsCartOpen,
    clearCart
  } = useCart();
  
  const { user } = useAuth();
  const { createOrder, processPayment } = useOrder();
  const navigate = useNavigate();
  
  const [isClosing, setIsClosing] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.displayName || '',
    note: ''
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const safeGetCartTotal = () => {
    try {
      return getCartTotal ? getCartTotal() : 0;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0;
    }
  };

  const handleClose = () => {
    console.log('Closing cart sidebar...');
    setIsClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsClosing(false);
      setShowCheckoutForm(false);
      setShowPaymentModal(false);
      setShowQRCode(false);
    }, 300);
  };

  const showToast = (message, type = 'success') => {
    console.log(`${type}: ${message}`);
    alert(`${type === 'error' ? 'Error: ' : ''}${message}`);
  };

  const handleCheckout = async (e) => {
    if (e) e.stopPropagation();
    
    console.log('Checkout clicked, cart items:', cartItems);
    
    if (!cartItems || cartItems.length === 0) {
      showToast('Keranjang kosong', 'error');
      return;
    }
    
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk checkout', 'error');
      handleClose();
      setTimeout(() => navigate('/login'), 350);
      return;
    }

    console.log('Showing checkout form');
    setShowCheckoutForm(true);
  };

  // Fungsi untuk memvalidasi dan membersihkan data order
  const validateAndCleanOrderData = (orderData) => {
    // Pastikan semua field memiliki nilai default
    const cleanedItems = orderData.items.map(item => ({
      productId: item.id || item.productId || '',
      title: item.title || 'Unknown Product',
      subtitle: item.subtitle || '',
      price: Number(item.price) || 0,
      image: item.image || '',
      quantity: Number(item.quantity) || 1,
      category: item.category || 'uncategorized',
      // Tambahkan field default lainnya
      description: item.description || '',
      slug: item.slug || ''
    }));

    const cleanedShippingAddress = {
      fullName: orderData.shippingAddress?.fullName?.trim() || '',
      note: orderData.shippingAddress?.note?.trim() || '',
      address: orderData.shippingAddress?.address || '',
      city: orderData.shippingAddress?.city || '',
      phone: orderData.shippingAddress?.phone || ''
    };

    return {
      items: cleanedItems,
      shippingAddress: cleanedShippingAddress,
      totalAmount: Number(safeGetCartTotal()) || 0,
      status: 'pending',
      paymentStatus: 'pending',
      notes: orderData.notes || `Checkout dari cart: ${cartItems.length} item`,
      customerNote: orderData.customerNote || cleanedShippingAddress.note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleProcessOrder = async () => {
    try {
      console.log('Processing order...');
      
      if (!cartItems || cartItems.length === 0) {
        showToast('Keranjang kosong', 'error');
        return;
      }

      if (!shippingAddress.fullName || !shippingAddress.fullName.trim()) {
        showToast('Harap isi nama lengkap', 'error');
        return;
      }

      setProcessingOrder(true);
      console.log('Creating order data...');

      const rawOrderData = {
        items: cartItems,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          note: shippingAddress.note
        },
        notes: `Checkout dari cart: ${cartItems.length} item`,
        customerNote: shippingAddress.note
      };

      // Bersihkan dan validasi data sebelum dikirim
      const cleanedOrderData = validateAndCleanOrderData(rawOrderData);
      
      console.log('Cleaned order data:', cleanedOrderData);

      const order = await createOrder(cleanedOrderData);
      console.log('Order created:', order);
      
      setCreatedOrder(order);
      setShowCheckoutForm(false);
      setShowPaymentModal(true);
      
      showToast('Pesanan berhasil dibuat! Silakan lanjutkan pembayaran.');
      
    } catch (error) {
      console.error('Error creating order from cart:', error);
      showToast('Gagal membuat pesanan: ' + error.message, 'error');
    } finally {
      setProcessingOrder(false);
    }
  };

  const handlePayment = () => {
    console.log('Payment method selected:', selectedPaymentMethod);
    
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
      
      if (createdOrder && createdOrder.id) {
        console.log('Processing cash payment for order:', createdOrder.id);
        await processPayment(createdOrder.id, 'cash');
      } else {
        throw new Error('Order tidak ditemukan');
      }
      
      if (clearCart) {
        clearCart();
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
      
      if (createdOrder && createdOrder.id) {
        console.log('Processing QRIS payment for order:', createdOrder.id);
        await processPayment(createdOrder.id, 'qris');
      } else {
        throw new Error('Order tidak ditemukan');
      }
      
      if (clearCart) {
        clearCart();
      }
      setShowQRCode(false);
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowPaymentModal(false);
      
      setCreatedOrder(null);
      setSelectedPaymentMethod('');
      setProcessingPayment(false);
      
      showToast('✅ Pembayaran QRIS berhasil! Tunggu konfirmasi admin.');
      
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error in QRIS payment:', error);
      setProcessingPayment(false);
      showToast('❌ Gagal memproses pembayaran: ' + error.message, 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleProductClick = (productId, e) => {
    if (e) e.stopPropagation();
    handleClose();
    setTimeout(() => {
      navigate(`/product/${productId}`);
    }, 350);
  };

  const handleRemoveItem = (productId, e) => {
    if (e) e.stopPropagation();
    if (removeFromCart) {
      removeFromCart(productId);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity, e) => {
    if (e) e.stopPropagation();
    
    if (newQuantity < 1) {
      if (removeFromCart) {
        removeFromCart(productId);
      }
    } else {
      if (updateQuantity) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  // Debug: Log state
  console.log('CartSidebar state:', {
    isCartOpen,
    isClosing,
    cartItems: cartItems?.length,
    showCheckoutForm,
    showPaymentModal,
    showQRCode
  });

  if (!isCartOpen && !isClosing) {
    console.log('CartSidebar not rendering: not open and not closing');
    return null;
  }

  console.log('CartSidebar rendering content...');

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Sidebar - Diperbaiki posisinya agar tidak tertutup navbar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-xs bg-gradient-to-b from-slate-900 to-blue-900 z-50 border-l border-blue-700/30 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ marginTop: '64px' }} // Memberikan margin top agar tidak tertutup navbar
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-3 border-b border-blue-700/30 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiShoppingBag className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Cart</h2>
                <p className="text-blue-300 text-xs">
                  {cartItems?.length || 0} item{(cartItems?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-7 h-7 bg-blue-800/50 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-200"
            >
              <FiX className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content Area - Diperbaiki tinggi nya */}
        <div className="flex flex-col h-[calc(100vh-64px-60px)]"> {/* Kurangi tinggi header cart */}
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3">
            {!showCheckoutForm ? (
              <>
                {!cartItems || cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-blue-800/30 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-600/20">
                      <FiShoppingBag className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-white text-base font-semibold mb-1">Cart Empty</h3>
                    <p className="text-blue-300 text-xs mb-4">
                      Add templates to get started
                    </p>
                    <button
                      onClick={handleClose}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 text-xs"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-blue-800/20 rounded-lg p-2 border border-blue-700/20 hover:border-cyan-500/30 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          {/* Product Image */}
                          <div 
                            className="w-10 h-10 rounded-lg overflow-hidden border border-blue-600/20 flex-shrink-0 cursor-pointer"
                            onClick={(e) => handleProductClick(item.id, e)}
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40x40/1e3a8a/ffffff?text=IMG';
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0 mr-2">
                                <h4 
                                  className="text-white font-semibold text-xs truncate cursor-pointer hover:text-cyan-200 transition-colors duration-200"
                                  onClick={(e) => handleProductClick(item.id, e)}
                                >
                                  {item.title || 'Unknown Product'}
                                </h4>
                                <p className="text-cyan-400 font-bold text-xs mt-0.5">
                                  Rp {(item.price || 0)?.toLocaleString()}
                                </p>
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                onClick={(e) => handleRemoveItem(item.id, e)}
                                className="w-5 h-5 bg-red-600/20 rounded flex items-center justify-center hover:bg-red-600/30 transition-all duration-200 flex-shrink-0"
                                title="Remove"
                              >
                                <FiTrash2 className="w-2.5 h-2.5 text-red-400" />
                              </button>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 bg-blue-900/30 rounded p-1 border border-blue-700/30">
                                <button
                                  onClick={(e) => handleUpdateQuantity(item.id, (item.quantity || 1) - 1, e)}
                                  className="w-5 h-5 bg-blue-700 rounded flex items-center justify-center hover:bg-blue-600 transition-all duration-200 disabled:opacity-40"
                                  disabled={(item.quantity || 1) <= 1}
                                >
                                  <FiMinus className="w-2.5 h-2.5 text-white" />
                                </button>
                                
                                <span className="text-white font-medium text-xs w-4 text-center">
                                  {item.quantity || 1}
                                </span>
                                
                                <button
                                  onClick={(e) => handleUpdateQuantity(item.id, (item.quantity || 1) + 1, e)}
                                  className="w-5 h-5 bg-blue-700 rounded flex items-center justify-center hover:bg-blue-600 transition-all duration-200"
                                >
                                  <FiPlus className="w-2.5 h-2.5 text-white" />
                                </button>
                              </div>
                              
                              {/* Subtotal */}
                              <div className="text-right">
                                <p className="text-cyan-300 text-xs font-medium">
                                  Rp {((item.price || 0) * (item.quantity || 1))?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Checkout Form */
              <div className="space-y-4">
                <div className="text-center py-4">
                  <h3 className="text-white font-semibold text-lg mb-2">Checkout</h3>
                  <p className="text-blue-300 text-sm">
                    {cartItems?.length || 0} item{(cartItems?.length || 0) !== 1 ? 's' : ''} • Rp {safeGetCartTotal().toLocaleString()}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
                  <h4 className="text-white font-semibold text-sm mb-2">Ringkasan Pesanan</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-blue-200 truncate flex-1 mr-2">
                          {item.title} × {item.quantity || 1}
                        </span>
                        <span className="text-cyan-300 font-medium">
                          Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-blue-700/30">
                    <span className="text-white font-semibold text-sm">Total</span>
                    <span className="text-cyan-400 font-bold">
                      Rp {safeGetCartTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="space-y-3">
                  <h4 className="text-white font-semibold text-sm">Informasi Pembeli</h4>
                  
                  <div>
                    <label className="block text-blue-300 text-xs mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-xs mb-1">Catatan (Opsional)</label>
                    <textarea
                      value={shippingAddress.note}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, note: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Catatan untuk penjual..."
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed at Bottom */}
          {cartItems && cartItems.length > 0 && (
            <div className="border-t border-blue-700/30 p-3 bg-slate-900/90">
              {!showCheckoutForm ? (
                /* Normal Cart Footer */
                <>
                  {/* Order Summary */}
                  <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-700/30 mb-1">
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200 text-xs">Items:</span>
                        <span className="text-white font-medium text-xs">
                          {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-blue-700/30">
                        <span className="text-blue-200 text-sm font-semibold">Total:</span>
                        <span className="text-cyan-400 font-bold text-base">
                          Rp {safeGetCartTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-1.5">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-900/30 flex items-center justify-center space-x-1 group text-xs"
                    >
                      <span>
                        {cartItems.length === 1 ? 'Checkout' : `Checkout (${cartItems.length})`}
                      </span>
                      <FiArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-200" />
                    </button>
                    
                    <button
                      onClick={handleClose}
                      className="w-full bg-blue-800/30 text-blue-200 py-2 rounded-lg font-semibold hover:bg-blue-800/50 transition-all duration-300 border border-blue-700/30 text-xs"
                    >
                      Continue Shopping
                    </button>
                  </div>

                  {/* Info Text */}
                  <p className="text-blue-400 text-[10px] text-center mt-1">
                    Click product to view details
                  </p>
                </>
              ) : (
                /* Checkout Form Footer */
                <div className="space-y-2">
                  <button
                    onClick={handleProcessOrder}
                    disabled={processingOrder || !shippingAddress.fullName.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {processingOrder ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4" />
                        <span>Buat Pesanan</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    disabled={processingOrder}
                    className="w-full bg-blue-800/30 text-blue-200 py-2 rounded-lg font-semibold hover:bg-blue-800/50 transition-all duration-300 border border-blue-700/30 text-xs"
                  >
                    Kembali ke Cart
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

            <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-700/30 mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300">Total Pembayaran</p>
                <p className="text-xl font-bold text-cyan-400">
                  {formatCurrency(createdOrder.totalAmount)}
                </p>
              </div>
              <p className="text-xs text-blue-300">Order ID: #{createdOrder.id?.slice(-8).toUpperCase()}</p>
              
              {createdOrder.shippingAddress?.note && (
                <div className="mt-3 pt-3 border-t border-blue-700/30">
                  <p className="text-xs text-blue-300 mb-1">Catatan Pembeli:</p>
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg">
                    "{createdOrder.shippingAddress.note}"
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
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

      {/* QR Code Modal - Menggunakan QRCodeModal Component */}
      <QRCodeModal
        showQRCode={showQRCode}
        setShowQRCode={setShowQRCode}
        createdOrder={createdOrder}
        handleQRISPayment={handleQRISPayment}
        processingPayment={processingPayment}
        formatCurrency={formatCurrency}
        product={cartItems[0]} // Mengambil product pertama dari cart
        quantity={cartItems.reduce((total, item) => total + (item.quantity || 1), 0)} // Total quantity semua items
      />
    </>
  );
};

export default CartSidebar;