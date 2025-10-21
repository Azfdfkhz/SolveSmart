import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  FiPackage, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiDownload,
  FiDollarSign,
  FiCreditCard,
  FiCopy,
  FiShoppingBag
} from 'react-icons/fi';
import { FaWhatsapp, FaSpinner } from 'react-icons/fa';

const Orders = () => {
  const { user } = useAuth();
  const { getUserOrders, processPayment, actionLoading } = useOrder();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState('');

  const userOrders = getUserOrders();

  useEffect(() => {
    if (!showPaymentModal) {
      setPaymentMethod('');
      setShowQRCode(false);
    }
  }, [showPaymentModal]);

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

  const getStatusDescription = (order) => {
    if (order.status === 'pending') {
      return 'Pesanan Anda sedang menunggu konfirmasi admin.';
    }
    if (order.status === 'accepted') {
      if (order.paymentStatus === 'unpaid') {
        return 'Pesanan telah diterima. Silakan lakukan pembayaran.';
      }
      return 'Pesanan sedang diproses. File akan segera dikirim.';
    }
    if (order.status === 'completed') {
      return 'Pesanan telah selesai. File sudah dapat diunduh.';
    }
    if (order.status === 'rejected') {
      return 'Pesanan ditolak. ' + (order.adminNotes || 'Silakan hubungi admin untuk informasi lebih lanjut.');
    }
    return '';
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    try {
      if (paymentMethod === 'qris') {
        setShowQRCode(true);
      } else {
        await processPayment(selectedOrder.id, paymentMethod);
        setShowPaymentModal(false);
        setSelectedOrder(null);
        alert('Pembayaran cash berhasil diproses! Silakan tunjukkan bukti ini ke admin.');
      }
    } catch (error) {
      alert('Error: ' + (error.message || 'Gagal memproses pembayaran'));
    }
  };

  const handleQRISPayment = async () => {
    try {
      await processPayment(selectedOrder.id, 'qris');
      setShowQRCode(false);
      setShowPaymentModal(false);
      setSelectedOrder(null);
      alert('Pembayaran QRIS berhasil diproses! Tunggu konfirmasi dari admin.');
    } catch (error) {
      alert('Error: ' + (error.message || 'Gagal memproses pembayaran QRIS'));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const generateQRCode = (orderId, amount) => {
    const qrData = `QRIS:ORDER-${orderId}:AMOUNT-${amount}:TIMESTAMP-${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(''), 2000);
  };


  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'qris': return <FaQrCode className="w-4 h-4" />;
      case 'cash': return <FiDollarSign className="w-4 h-4" />;
      default: return <FiCreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'qris': return 'QRIS';
      case 'cash': return 'Cash';
      default: return method || 'Belum dipilih';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Saya</h1>
          <p className="text-gray-600">Lihat dan kelola pesanan Anda</p>
        </div>

        {!userOrders || userOrders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada pesanan</h3>
            <p className="text-gray-600 mb-6">Mulai berbelanja dan pesanan Anda akan muncul di sini</p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id?.slice(-8).toUpperCase() || 'N/A'}
                        </h3>
                        <button 
                          onClick={() => copyOrderId(order.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors relative"
                          title="Salin Order ID"
                        >
                          <FiCopy className="w-4 h-4" />
                          {copiedOrderId === order.id && (
                            <span className="absolute -top-8 -left-2 bg-green-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                              Disalin!
                            </span>
                          )}
                        </button>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status, order.paymentStatus)}`}>
                        {getStatusText(order.status, order.paymentStatus)}
                      </span>
                    </div>
                    
                    {/* Status Description */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        {getStatusDescription(order)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tanggal</p>
                        <p className="font-semibold text-gray-900">
                          {order.createdAt?.toLocaleDateString?.('id-ID') || 'Unknown date'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Items</p>
                        <p className="font-semibold text-gray-900">
                          {order.items?.length || 0} produk
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Metode Bayar</p>
                        <p className="font-semibold text-gray-900">
                          <span className="capitalize flex items-center space-x-1">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <span>{getPaymentMethodName(order.paymentMethod)}</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {order.adminNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Catatan Admin:</strong> {order.adminNotes}
                        </p>
                      </div>
                    )}

                    {/* Delivery Files */}
                    {order.deliveryFiles && order.deliveryFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">File Pengiriman:</p>
                        <div className="space-y-2">
                          {order.deliveryFiles.map((file, index) => (
                            <a
                              key={index}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                            >
                              <FiDownload className="w-4 h-4" />
                              <span>{file.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 min-w-[200px]">
                    {/* Payment Button */}
                    {order.status === 'accepted' && order.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentModal(true);
                          setShowQRCode(false);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiDollarSign className="w-4 h-4" />
                        <span>Bayar Sekarang</span>
                      </button>
                    )}


                    {/* View Details */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiShoppingBag className="w-4 h-4" />
                      <span>Detail Pesanan</span>
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Items Pesanan:</h4>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.subtitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{item.quantity} x {formatCurrency(item.price)}</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency((item.price || 0) * (item.quantity || 1))}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Summary */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-lg text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Selection Modal */}
      {showPaymentModal && selectedOrder && !showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pilih Metode Pembayaran</h3>
            
            <div className="space-y-3 mb-6">
              {/* QRIS Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'qris' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setPaymentMethod('qris')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FiQrCode className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">QRIS</p>
                    <p className="text-sm text-gray-600">Bayar dengan scan QR Code</p>
                    <p className="text-xs text-green-600 mt-1">• Instan • Aman • Terintegrasi</p>
                  </div>
                  {paymentMethod === 'qris' && (
                    <FiCheck className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>

              {/* Cash Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cash</p>
                    <p className="text-sm text-gray-600">Bayar dengan tunai</p>
                    <p className="text-xs text-green-600 mt-1">• Langsung • Simple • No Fee</p>
                  </div>
                  {paymentMethod === 'cash' && (
                    <FiCheck className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">Total Pembayaran</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(selectedOrder.totalAmount)}
                </p>
              </div>
              <p className="text-xs text-gray-500">Order ID: #{selectedOrder.id?.slice(-8).toUpperCase()}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handlePayment}
                disabled={actionLoading || !paymentMethod}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjutkan</span>
                    <FiCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showPaymentModal && selectedOrder && showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Scan QR Code</h3>
            
            <div className="text-center mb-4">
              <p className="text-gray-600 mb-2">Scan QR code berikut untuk pembayaran</p>
              <p className="text-sm text-gray-500">Order ID: #{selectedOrder.id?.slice(-8).toUpperCase()}</p>
            </div>

            {/* QR Code Display */}
            <div className="flex justify-center mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <img 
                  src={generateQRCode(selectedOrder.id, selectedOrder.totalAmount)}
                  alt="QR Code"
                  className="w-64 h-64 mx-auto"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/256x256?text=QR+Code+Error';
                  }}
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Perhatian:</strong> Setelah pembayaran, klik "Sudah Bayar" dan tunggu konfirmasi dari admin.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowQRCode(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={handleQRISPayment}
                disabled={actionLoading}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Sudah Bayar</span>
                    <FiCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
