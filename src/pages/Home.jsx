import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import CartSidebar from '../components/CartSidebar';
import { FiChevronRight, FiShoppingBag, FiTrendingUp, FiPackage, FiAlertCircle } from 'react-icons/fi';

const Home = () => {
  const [activeTab, setActiveTab] = useState('All');
  const { user } = useAuth();
  const { products, loading } = useProduct();
  const { getCartItemsCount, toggleCart } = useCart();
  const navigate = useNavigate();

  // Debug: Log products data untuk inspeksi
  console.log('📦 Products data in Home:', products);
  console.log('🖼️ Product images:', products.map(p => ({ 
    id: p.id, 
    title: p.title, 
    image: p.image,
    hasImage: !!p.image 
  })));

  const activeProducts = useMemo(() => {
    const filtered = products.filter(product => 
      product.status !== 'Inactive' && 
      (product.stock === undefined || product.stock > 0)
    );
    console.log('✅ Active products:', filtered.length);
    return filtered;
  }, [products]);

  const tabs = useMemo(() => {
    const categories = ['All']; 
    
    activeProducts.forEach(product => {
      if (product.category && !categories.includes(product.category)) {
        categories.push(product.category);
      }
    });

    if (categories.length === 1) {
      return ['All', 'Template', 'Web', 'PPT', 'Poster', 'Social Media'];
    }

    return categories;
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'All') {
      return activeProducts;
    }
    return activeProducts.filter(product => product.category === activeTab);
  }, [activeProducts, activeTab]);

  const inactiveOrOutOfStockCount = useMemo(() => {
    return products.filter(product => 
      product.status === 'Inactive' || 
      (product.stock !== undefined && product.stock <= 0)
    ).length;
  }, [products]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Enhanced fallback image handler dengan debugging
  const handleImageError = (e, product) => {
    console.error('❌ Image failed to load:', {
      productId: product?.id,
      productTitle: product?.title,
      imageUrl: e.target.src,
      attemptedUrl: product?.image
    });
    
    e.target.src = 'https://via.placeholder.com/200x200/1e3a8a/ffffff?text=No+Image';
    e.target.alt = `Gambar tidak tersedia - ${product?.title || 'Product'}`;
    e.target.onerror = null; // Prevent infinite loop
    
    // Tambahkan styling untuk fallback image
    e.target.className = e.target.className + ' bg-blue-800/20';
  };

  // Improved image loading handler
  const handleImageLoad = (e, product) => {
    console.log('✅ Image loaded successfully:', {
      productId: product?.id,
      productTitle: product?.title,
      imageUrl: e.target.src
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <CartSidebar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
          {/* Welcome skeleton */}
          <div className="mb-6">
            <div className="h-8 bg-blue-800 rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-blue-800 rounded w-64 animate-pulse"></div>
          </div>

          {/* Banner skeleton */}
          <div className="mb-6">
            <div className="h-32 sm:h-48 bg-blue-800 rounded-2xl animate-pulse mb-4"></div>
          </div>

          {/* Tabs skeleton */}
          <div className="flex space-x-2 sm:space-x-3 mb-6 overflow-x-auto pb-2">
            {[1,2,3,4,5].map(item => (
              <div key={item} className="h-10 bg-blue-800 rounded-full w-20 sm:w-24 animate-pulse flex-shrink-0"></div>
            ))}
          </div>

          {/* Products skeleton */}
          <div className="space-y-3">
            {[1,2,3].map(item => (
              <div key={item} className="bg-blue-800 bg-opacity-30 rounded-2xl p-4 flex animate-pulse">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-700 rounded-xl mr-3 sm:mr-4 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 sm:h-6 bg-blue-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-blue-700 rounded w-1/2 mb-2 sm:mb-3"></div>
                  <div className="h-4 sm:h-5 bg-blue-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {user?.displayName || "User"} 
              </h2>
              <p className="text-blue-200 text-base sm:text-lg">
                Smart Solution Complete Result...
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-800 bg-opacity-50 px-3 sm:px-4 py-2 rounded-2xl border border-blue-700 self-start">
              <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <span className="text-white text-xs sm:text-sm font-medium">
                {filteredProducts.length} Available Products
              </span>
            </div>
          </div>
        </div>

        {/* Info tentang produk yang tidak tersedia */}
        {inactiveOrOutOfStockCount > 0 && (
          <div className="mb-4 p-3 sm:p-4 bg-amber-900 bg-opacity-20 border border-amber-700 border-opacity-30 rounded-2xl backdrop-blur-sm">
            <div className="flex items-start sm:items-center space-x-3">
              <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-amber-200 text-sm">
                  <span className="font-semibold">{inactiveOrOutOfStockCount} product(s)</span> are currently unavailable 
                  {inactiveOrOutOfStockCount === 1 ? ' (inactive or out of stock)' : ' (inactive or out of stock)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <div className="mb-6 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-blue-700 border-opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
          
          <div className="relative z-10 p-6 sm:p-8 md:p-12">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Disini <span className="text-cyan-400">Nanti Iklan</span>
              </h1>
              
              <p className="text-blue-100 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 leading-relaxed">
                propesional bukan? bukan
              </p>
              
              <button 
                onClick={() => setActiveTab('All')}
                className="bg-white text-blue-900 px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-cyan-50 transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                gabisa dipencet
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-1/4 right-1/4 w-24 sm:w-32 h-24 sm:h-32 bg-cyan-400 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 right-1/3 w-16 sm:w-24 h-16 sm:h-24 bg-white rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 sm:space-x-3 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => {
              // Hitung jumlah produk aktif per kategori
              const productCount = tab === 'All' 
                ? activeProducts.length 
                : activeProducts.filter(p => p.category === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center space-x-2 flex-shrink-0 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-blue-800 bg-opacity-30 text-blue-200 hover:bg-blue-800 hover:bg-opacity-50 border border-blue-700 border-opacity-30'
                  }`}
                >
                  <FiShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">{tab}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-700 text-blue-200'
                  }`}>
                    {productCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Count Info */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <p className="text-blue-300 text-sm">
              Showing {filteredProducts.length} available product{filteredProducts.length !== 1 ? 's' : ''} 
              {activeTab !== 'All' && ` in ${activeTab}`}
            </p>
            
            {/* Total products info */}
            {products.length > activeProducts.length && (
              <p className="text-amber-400 text-xs">
                {products.length - activeProducts.length} unavailable
              </p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-3 sm:space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-blue-800 bg-opacity-20 rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-blue-700 border-opacity-30 backdrop-blur-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-700 bg-opacity-30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600 border-opacity-20">
                  <FiPackage className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">
                  No {activeTab !== 'All' ? activeTab : ''} Products Available
                </h3>
                <p className="text-blue-300 text-xs sm:text-sm mb-4">
                  {activeTab !== 'All' 
                    ? `No available products found in ${activeTab} category` 
                    : 'No products available at the moment'
                  }
                </p>
                <div className="space-y-2">
                  {activeTab !== 'All' && (
                    <button
                      onClick={() => setActiveTab('All')}
                      className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm font-medium block"
                    >
                      View All Available Products
                    </button>
                  )}
                  {inactiveOrOutOfStockCount > 0 && (
                    <p className="text-amber-400 text-xs">
                      {inactiveOrOutOfStockCount} product(s) are currently unavailable
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => {
              console.log('🎯 Rendering product:', { 
                id: product.id, 
                title: product.title, 
                image: product.image,
                hasValidImage: product.image && product.image.startsWith('http')
              });
              
              return (
                <div 
                  key={product.id}
                  className="group bg-gradient-to-br from-blue-800/30 to-blue-900/20 rounded-2xl sm:rounded-3xl p-3 sm:p-4 cursor-pointer hover:from-blue-700/40 hover:to-blue-800/30 transition-all duration-500 border border-blue-700 border-opacity-20 hover:border-cyan-500 hover:border-opacity-30 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-900/20 transform hover:-translate-y-0.5 sm:hover:-translate-y-1"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-blue-600 border-opacity-20 group-hover:border-cyan-500 group-hover:border-opacity-50 transition-all duration-300 bg-blue-800/20">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => handleImageError(e, product)}
                          onLoad={(e) => handleImageLoad(e, product)}
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Stock Badge */}
                      {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">{product.stock}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-1 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-100 transition-colors duration-300 truncate">
                              {product.title}
                            </h3>
                            {product.category && (
                              <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full border border-cyan-400/30 self-start sm:self-auto">
                                {product.category}
                              </span>
                            )}
                          </div>
                          <p className="text-blue-300 text-xs sm:text-sm mt-1 line-clamp-2">
                            {product.subtitle}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-cyan-400 font-bold text-base sm:text-lg">
                            Rp {product.price?.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-blue-400 text-xs sm:text-sm line-through">
                              Rp {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          
                          {/* Stock Info */}
                          {product.stock !== undefined && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.stock > 10 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : product.stock > 5
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {product.stock > 10 ? 'Stock Ready' : 
                              product.stock > 5 ? `${product.stock} lagi` : 
                              `Only ${product.stock} lagi`}
                            </span>
                          )}
                        </div>
                        
                        {/* HANYA TOMBOL DETAIL (CHEVRON) SAJA */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:from-cyan-500 group-hover:to-blue-500 transition-all duration-300 shadow-lg shadow-blue-900/30 group-hover:shadow-cyan-900/40 self-end sm:self-auto">
                          <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white transform group-hover:translate-x-0.5 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Admin Info - hanya tampil untuk admin */}
        {user && user.isAdmin && inactiveOrOutOfStockCount > 0 && (
          <div className="mt-6 p-3 sm:p-4 bg-slate-800 bg-opacity-50 border border-slate-700 rounded-2xl backdrop-blur-sm">
            <div className="flex items-start sm:items-center space-x-3">
              <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-amber-300 font-semibold text-sm mb-1">Admin View</h4>
                <p className="text-slate-300 text-xs">
                  {inactiveOrOutOfStockCount} product(s) are hidden from customers 
                  ({products.filter(p => p.status === 'Inactive').length} inactive, 
                  {products.filter(p => p.stock !== undefined && p.stock <= 0).length} out of stock)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Cart Button */}
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40">
          <button 
            onClick={toggleCart}
            className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-900/40 hover:shadow-cyan-900/60 transition-all duration-300 transform hover:scale-110 group border border-cyan-400 border-opacity-30"
          >
            <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:scale-110 transition-transform duration-300" />
            
            {/* Cart Badge */}
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                {getCartItemsCount() > 99 ? '99+' : getCartItemsCount()}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
