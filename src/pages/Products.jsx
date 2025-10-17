// pages/Products.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiArrowLeft } from 'react-icons/fi';
import { FaBox, FaMoneyBillWave, FaChartBar } from 'react-icons/fa';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Smartphone Samsung A54',
      price: 4200000,
      category: 'Elektronik',
      stock: 15,
      description: 'Smartphone dengan kamera 50MP dan baterai 5000mAh',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  
  // ... (rest of your products logic)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                <FiArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kelola Produk</h1>
                <p className="text-gray-600">Manage produk jualan Anda</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition duration-200"
            >
              <FiPlus className="text-lg" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Products content here */}
        <div className="text-center py-12">
          <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Halaman Products</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;