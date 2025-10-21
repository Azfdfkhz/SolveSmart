import React, { useState } from 'react';
import { FaSpinner, FaDownload, FaQrcode } from 'react-icons/fa';
import { FiCheck, FiX, FiCopy, FiMessageCircle, FiInfo } from 'react-icons/fi';
import { MdPayment, MdOutlineSecurity } from 'react-icons/md';

const QRCodeModal = ({
  showQRCode,
  setShowQRCode,
  createdOrder,
  handleQRISPayment,
  processingPayment,
  formatCurrency,
  product,
  quantity,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qr');

  if (!showQRCode || !createdOrder) return null;

  const customQRISImage = '/images/qris-solvesmart.jpg';

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = customQRISImage;
    link.download = `QRIS-SolveSmart-${createdOrder.id?.slice(-8)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyOrderInfo = () => {
    const orderText = `Order #${createdOrder.id?.slice(-8).toUpperCase()}\nTotal: ${formatCurrency(createdOrder.totalAmount)}\nProduk: ${product.title}\nQuantity: ${quantity}`;
    navigator.clipboard.writeText(orderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PaymentSteps = () => (
    <div className="space-y-3">
      {[
        'Buka aplikasi e-wallet/m-banking',
        'Pilih fitur Scan QRIS',
        'Arahkan kamera ke kode QR',
        'Konfirmasi jumlah pembayaran',
        'Tunggu konfirmasi otomatis'
      ].map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{index + 1}</span>
          </div>
          <span className="text-sm text-gray-300">{step}</span>
        </div>
      ))}
    </div>
  );

  const SecurityInfo = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
        <MdOutlineSecurity className="text-green-400" />
        <span className="text-sm text-green-400">Pembayaran 100% Aman dan Terenkripsi</span>
      </div>
      <div className="text-xs text-gray-400 space-y-2">
        <p>• Transaksi diproses dengan standar keamanan tinggi</p>
        <p>• Data pembayaran Anda terlindungi</p>
        <p>• Konfirmasi otomatis dalam 1-2 menit</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-2xl p-6 w-full max-w-lg border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <FaQrcode className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">QRIS Payment</h3>
              <p className="text-sm text-cyan-400">SolveSmart • Aman & Cepat</p>
            </div>
          </div>
          <button 
            onClick={() => setShowQRCode(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-gray-400 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-gray-400 text-sm">Order ID</span>
              <p className="font-mono text-cyan-400 font-bold text-lg">
                #{createdOrder.id?.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-sm">Total Amount</span>
              <p className="font-bold text-white text-xl">
                {formatCurrency(createdOrder.totalAmount)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{product.title}</p>
              <p className="text-cyan-400 text-sm">Qty: {quantity} × {formatCurrency(product.price)}</p>
            </div>
          </div>

          {createdOrder.shippingAddress?.note && (
            <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-amber-300 text-sm">
                <strong>📝 Catatan:</strong> {createdOrder.shippingAddress.note}
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
          {[
            { id: 'qr', label: 'QR Code', icon: FaQrcode },
            { id: 'steps', label: 'Cara Bayar', icon: MdPayment },
            { id: 'security', label: 'Keamanan', icon: MdOutlineSecurity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium ${
                activeTab === tab.id 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {activeTab === 'qr' && (
            <div className="text-center">
              <div className="relative inline-block">
                <div className="border-4 border-cyan-500/30 rounded-2xl p-4 bg-white shadow-2xl">
                  <img 
                    src={customQRISImage}
                    alt="QRIS SolveSmart"
                    className="w-56 h-56 mx-auto object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/256x256/1e293b/0ea5e9?text=QRIS+SolveSmart';
                    }}
                  />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  SolveSmart
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && <PaymentSteps />}
          {activeTab === 'security' && <SecurityInfo />}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={handleDownloadQR}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium hover:scale-105 active:scale-95"
          >
            <FaDownload className="w-4 h-4" />
            <span>Download QR</span>
          </button>
          <button
            onClick={copyOrderInfo}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium hover:scale-105 active:scale-95 relative"
          >
            <FiCopy className="w-4 h-4" />
            <span>Copy Info</span>
            {copied && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                Copied!
              </div>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowQRCode(false)}
            disabled={processingPayment}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 border border-white/10"
          >
            Tutup
          </button>
          <button
            onClick={handleQRISPayment}
            disabled={processingPayment}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
          >
            {processingPayment ? (
              <>
                <FaSpinner className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                <span>Sudah Bayar</span>
              </>
            )}
          </button>
        </div>

        {/* Support */}
        <div className="text-center mt-6 pt-4 border-t border-white/10">
          <button 
            onClick={() => window.location.href = '/chat'}
            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm mx-auto hover:scale-105"
          >
            <FiMessageCircle className="w-4 h-4" />
            <span>Butuh bantuan? Chat support kami</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;