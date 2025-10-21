// pages/Products.jsx (MULTIPLE IMAGES VERSION)
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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [productForm, setProductForm] = useState({
    title: '',
    subtitle: '',
    price: '',
    category: '',
    images: []
  });

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      subtitle: product.subtitle,
      price: product.price.toString(),
      category: product.category,
      images: product.images || [product.image].filter(Boolean) // Support both single and multiple images
    });
    setImagePreviews(product.images || [product.image].filter(Boolean));
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
      images: []
    });
    setImagePreviews([]);
    setShowModal(true);
  };

  // Handle file selection - MULTIPLE IMAGES
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validasi files
    const validFiles = files.filter(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar (max 2MB)`);
        return false;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} harus format JPEG, JPG, PNG, atau WebP`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews untuk semua files
    const newPreviews = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Store file objects for upload
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const uploadImageToFirebase = async (file) => {
    try {
      console.log('📤 Starting image upload...', file.name);
      
      const timestamp = Date.now();
      const fileName = `product_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `products/${fileName}`);
      
      console.log('🔄 Uploading to:', `products/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      console.log('✅ Upload successful:', snapshot);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🌐 Download URL:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Gagal upload gambar: ${error.message}`);
    }
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productForm.title.trim()) {
      alert('Judul produk harus diisi');
      return;
    }

    if (!productForm.price || Number(productForm.price) <= 0) {
      alert('Harga produk harus lebih dari 0');
      return;
    }

    if (productForm.images.length === 0 && !editingProduct) {
      alert('Pilih minimal 1 gambar produk');
      return;
    }

    setUploading(true);
    
    try {
      let imageUrls = [];

      console.log('🛠️ Processing product data...');
      console.log('Images to process:', productForm.images);

      const filesToUpload = productForm.images.filter(img => img instanceof File);
      if (filesToUpload.length > 0) {
        console.log('🖼️ Uploading new images...');
        for (const file of filesToUpload) {
          const imageUrl = await uploadImageToFirebase(file);
          imageUrls.push(imageUrl);
        }
        console.log('✅ New images uploaded:', imageUrls);
      }

      const existingUrls = productForm.images.filter(img => typeof img === 'string');
      imageUrls = [...imageUrls, ...existingUrls];

      if (imageUrls.length === 0 && editingProduct) {
        imageUrls = editingProduct.images || [editingProduct.image].filter(Boolean);
      }

      console.log('🎯 Final image URLs:', imageUrls);

      const productData = {
        title: productForm.title.trim(),
        subtitle: productForm.subtitle.trim(),
        price: Number(productForm.price),
        category: productForm.category.trim() || 'Uncategorized',
        images: imageUrls, 
        image: imageUrls[0] ||'', 
        status: 'Active',
        stock: 999,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('💾 Saving product data:', productData);

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        alert('✅ Produk berhasil diupdate!');
      } else {
        await addProduct(productData);
        alert('✅ Produk berhasil ditambahkan!');
      }

      // Reset form
      setProductForm({
        title: '',
        subtitle: '',
        price: '',
        category: '',
        images: []
      });
      setImagePreviews([]);
      setShowModal(false);
      setEditingProduct(null);

      // Refresh products list
      refreshProducts();

    } catch (error) {
      console.error('❌ Error saving product:', error);
      alert(error.message || 'Gagal menyimpan produk. Coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Yakin hapus produk ini?')) {
      try {
        await deleteProduct(productId);
        alert('✅ Produk berhasil dihapus!');
      } catch (error) {
        alert('❌ Gagal menghapus produk');
      }
    }
  };

  // Enhanced image error handler
  const handleImageError = (e, product) => {
    console.error('❌ Image failed to load:', {
      productId: product?.id,
      productTitle: product?.title, 
      imageUrl: product?.image
    });
    
    e.target.src = 'https://via.placeholder.com/300x200/1e3a8a/ffffff?text=Image+Not+Found';
    e.target.alt = `Gambar tidak tersedia - ${product?.title || 'Product'}`;
    e.target.onerror = null;
  };

  // Debug: Log products untuk inspeksi
  console.log('📦 Products data:', products);
  console.log('🖼️ Product images check:', products.map(p => ({
    id: p.id,
    title: p.title,
    hasImage: !!p.image,
    hasImages: !!(p.images && p.images.length > 0),
    imageType: typeof p.image,
    imageUrl: p.image,
    imagesCount: p.images ? p.images.length : 0
  })));

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
                  {/* GUNAKAN SINGLE IMAGE (image) untuk Home compatibility */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => handleImageError(e, product)}
                    loading="lazy"
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
                  
                  {/* Multiple Images Badge */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        +{product.images.length - 1} more
                      </div>
                    </div>
                  )}
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
                      <button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-lg"
                      >
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

      {/* Add/Edit Product Modal - MULTIPLE IMAGES */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-2xl border border-blue-700/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Multiple Images Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">
                    Product Images {!editingProduct && '*'}
                    <span className="text-blue-400 text-xs ml-2">(Max 5 images, 2MB each)</span>
                  </label>
                  
                  {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-cyan-500/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                      
                      {imagePreviews.length < 5 && (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-blue-600/30 rounded-lg p-4 text-center cursor-pointer hover:border-cyan-500/50 transition-colors bg-blue-800/20 h-32 flex flex-col items-center justify-center"
                        >
                          <FiUpload className="w-6 h-6 text-blue-400 mb-2" />
                          <p className="text-blue-300 text-xs">Add More</p>
                          <p className="text-blue-400 text-xs mt-1">{5 - imagePreviews.length} left</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-600/30 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-colors bg-blue-800/20"
                    >
                      <FiUpload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-300 text-sm">Click to upload product images</p>
                      <p className="text-blue-400 text-xs mt-1">JPEG, PNG, WebP (Max 2MB per image)</p>
                      <p className="text-cyan-400 text-xs mt-1">Max 5 images</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    multiple
                  />
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Product title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({...productForm, subtitle: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Product description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Price *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Category</label>
                      <input
                        type="text"
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-blue-700/30 rounded-lg text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Category"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={uploading}
                    className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-semibold hover:bg-slate-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        <span>{editingProduct ? 'Update' : 'Create'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
