// pages/Products.jsx (Firebase Storage Full Version)
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { FiPlus, FiEdit, FiTrash2, FiArrowLeft, FiUpload, FiX, FiRefreshCw, FiSave, FiStar, FiShoppingBag } from 'react-icons/fi';
import { FaBox, FaSpinner, FaCrown } from 'react-icons/fa';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const Products = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshProducts } = useProduct();
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [productForm, setProductForm] = useState({
    title: '',
    subtitle: '',
    price: '',
    category: '',
    image: null
  });

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      subtitle: product.subtitle,
      price: product.price.toString(),
      category: product.category,
      image: product.image
    });
    setImagePreview(product.image);
    setShowModal(true);
  };

  // Handle add new product
  const handleAddNew = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      subtitle: '',
      price: '',
      category: '',
      image: null
    });
    setImagePreview(null);
    setShowModal(true);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      alert('File maksimal 1MB untuk upload cepat');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Hanya format JPEG, JPG, PNG yang didukung');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    setProductForm({...productForm, image: file});
  };

  // Handle form submit (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.image && !imagePreview) {
      alert('Pilih gambar produk terlebih dahulu');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = productForm.image;

      // Upload ke Firebase Storage jika image baru berupa File
      if (productForm.image instanceof File) {
        const storageRef = ref(storage, `products/${Date.now()}-${productForm.image.name}`);
        await uploadBytes(storageRef, productForm.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...productForm,
          image: imageUrl
        });
        alert('Produk berhasil diupdate!');
      } else {
        await addProduct({
          ...productForm,
          image: imageUrl
        });
        alert('Produk berhasil ditambahkan!');
      }

      setProductForm({
        title: '',
        subtitle: '',
        price: '',
        category: '',
        image: null
      });
      setImagePreview(null);
      setShowModal(false);
      setEditingProduct(null);

    } catch (error) {
      alert(error.message || 'Gagal menyimpan produk');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Hapus produk ini?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        alert('Gagal menghapus produk');
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setProductForm({...productForm, image: null});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Skeleton loader
  const ProductSkeleton = () => (
    <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 rounded-2xl p-4 border border-blue-700/30 backdrop-blur-sm animate-pulse">
      <div className="w-full h-48 bg-blue-800/40 rounded-xl mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-blue-800/40 rounded w-3/4"></div>
        <div className="h-3 bg-blue-800/40 rounded w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-blue-800/40 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-blue-800/40 rounded-lg"></div>
            <div className="w-8 h-8 bg-blue-800/40 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800/30 to-cyan-800/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-blue-700/30 shadow-2xl shadow-blue-900/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => isAdmin ? navigate('/dashboard') : navigate('/home')}
                className="p-3 bg-blue-800/40 backdrop-blur-sm rounded-xl hover:bg-blue-700/50 transition-all duration-300 border border-blue-600/30 hover:border-cyan-500/30"
              >
                <FiArrowLeft className="text-lg text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FiShoppingBag className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {isAdmin ? 'Product Management' : 'Premium Collection'}
                    </h1>
                    <p className="text-blue-200">
                      {products.length} premium products available
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={refreshProducts}
                disabled={loading}
                className="flex items-center gap-3 bg-blue-800/40 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-blue-700/50 transition-all duration-300 border border-blue-600/30 hover:border-cyan-500/30 shadow-lg"
              >
                <FiRefreshCw className={`text-lg ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/40 transform hover:-translate-y-0.5"
                >
                  <FiPlus className="text-lg" />
                  <span>Add Product</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="bg-gradient-to-br from-blue-800/20 to-cyan-800/10 backdrop-blur-xl rounded-3xl p-12 border border-blue-700/30 shadow-2xl">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-700/30 to-cyan-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-600/30">
                  <FaBox className="text-4xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Products Available</h3>
                <p className="text-blue-300 text-lg mb-6">
                  {isAdmin ? 'Start building your premium collection' : 'Premium products coming soon'}
                </p>
                {isAdmin && (
                  <button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                  >
                    Create First Product
                  </button>
                )}
              </div>
            </div>
          ) : (
            products.map((product) => (
              <div 
                key={product.id} 
                className="group bg-gradient-to-br from-slate-800/40 to-blue-900/30 backdrop-blur-xl rounded-2xl p-4 border border-blue-700/30 hover:border-cyan-500/40 transition-all duration-500 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-cyan-900/20 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => e.target.src='/default-product.png'}
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <FiStar className="w-3 h-3" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                      {product.category}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1 line-clamp-1 group-hover:text-cyan-100 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-blue-300 text-sm line-clamp-2">{product.subtitle}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold text-xl">
                        Rp {product.price?.toLocaleString()}
                      </span>
                    </div>
                    
                    {isAdmin ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 bg-blue-700/40 backdrop-blur-sm rounded-lg text-cyan-300 hover:bg-cyan-600 hover:text-white transition-all duration-300 border border-blue-600/30 hover:border-cyan-500/50"
                        >
                          <FiEdit className="text-sm" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-blue-700/40 backdrop-blur-sm rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 border border-blue-600/30 hover:border-red-500/50"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal & Floating Add Button tetap sama seperti Luxury Version */}

    </div>
  );
};

export default Products;
