// pages/ProductDetail.jsx (SIMPLIFIED VERSION)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import CartSidebar from '../components/CartSidebar';
import CheckoutModal from '../components/CheckoutModal';
import PaymentMethodModal from '../components/PaymentMethodModal';
import QRCodeModal from '../components/QRCodeModal';
import { 
  FiArrowLeft, 
  FiShoppingCart, 
  FiHeart, 
  FiShare2, 
  FiStar,
  FiCheck
} from 'react-icons/fi';
import { FaSpinner, FaTimesCircle } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading } = useProduct();
  const { createOrder, processPayment, actionLoading } = useOrder();
  const { addToCart, getCartItemsCount, toggleCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState(null);
  
  // Modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.displayName || '',
    note: ''
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

  // FUNGSI ADD TO CART
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      ...product,
      quantity: quantity
    });
    
    showToast(`${quantity} ${product.title} ditambahkan ke keranjang! 🛒`);
    
    setTimeout(() => {
      toggleCart();
    }, 1000);
  };

  const handleBuyNow = () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk membeli', 'error');
      navigate('/login');
      return;
    }
    if (!product) return;
    
    setShowCheckoutModal(true);
  };

  const handleCheckout = async () => {
    try {
      if (!product) return;

      if (!shippingAddress.fullName) {
        showToast('Harap isi nama lengkap', 'error');
        return;
      }

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
        shippingAddress: {
          fullName: shippingAddress.fullName,
          note: shippingAddress.note
        },
        notes: `Pembelian langsung: ${product.title}`,
        customerNote: shippingAddress.note
      };

      const order = await createOrder(orderData);
      
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
      
      if (createdOrder && createdOrder.id) {
        await processPayment(createdOrder.id, 'cash');
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
      
      if (createdOrder && createdOrder.id) {
        await processPayment(createdOrder.id, 'qris');
      } else {
        throw new Error('Order tidak ditemukan');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <CartSidebar />
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
        <CartSidebar />
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

  const productImages = [product.image];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Cart Sidebar */}
      <CartSidebar />

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
        {/* Back Button */}
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
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-800/30 to-cyan-800/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-700/30">
              <img
                src={productImages[selectedImage]}
                alt={product.title}
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl sm:rounded-2xl"
              />
            </div>
            
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
            <div className="bg-gradient-to-br from-blue-800/20 to-purple-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-700/30">
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
              
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {product.title}
              </h1>
              
              <p className="text-blue-200 text-sm sm:text-base mb-4 line-clamp-2">
                {product.subtitle || "Template premium berkualitas tinggi"}
              </p>

              <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4 sm:mb-6">
                Rp {product.price?.toLocaleString()}
              </div>

              <div className="space-y-3 sm:space-y-4">
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

      {/* Payment Modals */}
      <CheckoutModal
        showCheckoutModal={showCheckoutModal}
        setShowCheckoutModal={setShowCheckoutModal}
        product={product}
        quantity={quantity}
        shippingAddress={shippingAddress}
        setShippingAddress={setShippingAddress}
        handleCheckout={handleCheckout}
        actionLoading={actionLoading}
      />

      <PaymentMethodModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        createdOrder={createdOrder}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        setShowQRCode={setShowQRCode}
        handlePayment={handlePayment}
        processingPayment={processingPayment}
        formatCurrency={formatCurrency}
        product={product}
        quantity={quantity}
      />

      <QRCodeModal
        showQRCode={showQRCode}
        setShowQRCode={setShowQRCode}
        createdOrder={createdOrder}
        handleQRISPayment={handleQRISPayment}
        processingPayment={processingPayment}
        formatCurrency={formatCurrency}
        product={product}
        quantity={quantity}
      />

      {/* Floating Cart Button */}
      <div className="fixed bottom-4 right-4 z-20">
        <button 
          onClick={toggleCart}
          className="relative w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-900/40 hover:shadow-cyan-900/60 transition-all duration-300 transform hover:scale-110 group border border-cyan-400 border-opacity-30"
        >
          <FiShoppingCart className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-300" />
          
          {getCartItemsCount() > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
              {getCartItemsCount()}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Buy Now Button */}
      <div className="fixed bottom-4 left-4 right-20 z-20 lg:hidden">
        <button
          onClick={handleBuyNow}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold text-center shadow-2xl w-full text-sm"
        >
          Beli Sekarang - Rp {product?.price?.toLocaleString()}
        </button>
      </div>

      <div className="h-16 lg:h-0"></div>
    </div>
  );
};

export default ProductDetail;