// components/CheckoutModal.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';

const CheckoutModal = ({
  showCheckoutModal,
  setShowCheckoutModal,
  product,
  quantity,
  shippingAddress,
  setShippingAddress,
  handleCheckout,
  actionLoading
}) => {
  if (!showCheckoutModal) return null;

  return (
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

        {/* FORM PENGIRIMAN & CATATAN */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-white mb-3">Informasi Pembeli</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-blue-300 text-sm mb-2">Nama Lengkap *</label>
              <input
                type="text"
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label className="block text-blue-300 text-sm mb-2">Catatan Tambahan (Opsional)</label>
              <textarea
                value={shippingAddress.note}
                onChange={(e) => setShippingAddress({ ...shippingAddress, note: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Contoh: Tolong dibungkus rapat, tambahkan bonus stiker, atau info khusus lainnya"
                rows="3"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-100/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
            Jika ada kendala atau permintaan khusus, silakan <strong>chat admin</strong> melalui navbar chat.
          </div>
        </div>

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
  );
};

export default CheckoutModal;