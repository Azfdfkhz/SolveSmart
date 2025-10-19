// components/QRCodeModal.jsx
import React from 'react';
import { FaSpinner, FaTimesCircle } from 'react-icons/fa';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';

const QRCodeModal = ({
  showQRCode,
  setShowQRCode,
  createdOrder,
  handleQRISPayment,
  processingPayment,
  formatCurrency,
  product,
  quantity
}) => {
  if (!showQRCode || !createdOrder) return null;

  const generateQRCode = (orderId, amount) => {
    const qrData = `QRIS:ORDER-${orderId}:AMOUNT-${amount}:TIMESTAMP-${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md border border-blue-700/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Scan QR Code</h3>
          <button 
            onClick={() => setShowQRCode(false)}
            className="text-blue-300 hover:text-white"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-blue-300 mb-2">Scan QR code berikut untuk pembayaran</p>
          <p className="text-sm text-blue-400">Order ID: #{createdOrder.id?.slice(-8).toUpperCase()}</p>
          
          {createdOrder.shippingAddress?.note && (
            <div className="mt-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-amber-300">
                <strong>Catatan:</strong> {createdOrder.shippingAddress.note}
              </p>
            </div>
          )}
        </div>

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
          
          <div className="mt-2 pt-2 border-t border-blue-700/30">
            <div className="flex items-center space-x-2">
              <img 
                src={product.image} 
                alt={product.title}
                className="w-6 h-6 object-cover rounded"
              />
              <p className="text-xs text-blue-300 truncate">{product.title}</p>
              <p className="text-xs text-cyan-400 ml-auto">Qty: {quantity}</p>
            </div>
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
  );
};

export default QRCodeModal;