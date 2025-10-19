// components/PaymentMethodModal.jsx
import React from 'react';
import { FaQrcode, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import { FiCheck, FiCreditCard, FiDollarSign, FiArrowLeft } from 'react-icons/fi';

const PaymentMethodModal = ({
  showPaymentModal,
  setShowPaymentModal,
  createdOrder,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  setShowQRCode,
  handlePayment,
  processingPayment,
  formatCurrency,
  product,
  quantity
}) => {
  if (!showPaymentModal || !createdOrder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md border border-blue-700/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Pilih Metode Pembayaran</h3>
          <button 
            onClick={() => {
              setShowPaymentModal(false);
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
  );
};

export default PaymentMethodModal;