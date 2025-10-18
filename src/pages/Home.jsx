// Home.jsx (Modern Luxury Blue)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import Navbar from '../components/Navbar';
import { FiChevronRight, FiStar, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';

const Home = () => {
  const [activeTab, setActiveTab] = useState('Template');
  const { user } = useAuth();
  const { products, loading } = useProduct();
  const navigate = useNavigate();

  const tabs = ['Template', 'Web', 'PPT', 'Poster', 'Social Media'];

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Skeleton Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
          {/* Welcome Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-blue-800 rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-blue-800 rounded w-64 animate-pulse"></div>
          </div>

          {/* Banner Skeleton */}
          <div className="mb-8">
            <div className="h-48 bg-blue-800 rounded-2xl animate-pulse mb-6"></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex space-x-3 mb-8">
            {[1,2,3,4,5].map(item => (
              <div key={item} className="h-10 bg-blue-800 rounded-full w-24 animate-pulse"></div>
            ))}
          </div>

          {/* Products Skeleton */}
          <div className="space-y-4">
            {[1,2,3].map(item => (
              <div key={item} className="bg-blue-800 bg-opacity-30 rounded-2xl p-4 flex animate-pulse">
                <div className="w-24 h-24 bg-blue-700 rounded-xl mr-4"></div>
                <div className="flex-1">
                  <div className="h-6 bg-blue-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-blue-700 rounded w-1/2 mb-3"></div>
                  <div className="h-5 bg-blue-700 rounded w-20"></div>
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

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.displayName || "User"} 👋
              </h2>
              <p className="text-blue-200 text-lg">
                Smart Solution Complete Result
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-blue-800 bg-opacity-50 px-4 py-2 rounded-2xl border border-blue-700">
              <FiTrendingUp className="w-5 h-5 text-cyan-400" />
              <span className="text-white text-sm font-medium">Best Quality</span>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="mb-8 relative rounded-3xl overflow-hidden shadow-2xl border border-blue-700 border-opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="max-w-2xl">
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Disini <span className="text-cyan-400">Nanti Iklan</span>
              </h1>
              
              <p className="text-blue-100 text-lg md:text-xl mb-6 leading-relaxed">
                Professional templates designed to make your projects stand out with luxury quality
              </p>
              
              <button className="bg-white text-blue-900 px-8 py-3 rounded-2xl font-semibold hover:bg-cyan-50 transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 transform hover:-translate-y-0.5">
                Explore Collection
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-cyan-400 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-white rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="mb-8">
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-blue-800 bg-opacity-30 text-blue-200 hover:bg-blue-800 hover:bg-opacity-50 border border-blue-700 border-opacity-30'
                }`}
              >
                <FiShoppingBag className="w-4 h-4" />
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-blue-800 bg-opacity-20 rounded-3xl p-12 border border-blue-700 border-opacity-30 backdrop-blur-sm">
                <div className="w-20 h-20 bg-blue-700 bg-opacity-30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600 border-opacity-20">
                  <FiShoppingBag className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">No Products Available</h3>
                <p className="text-blue-300 text-sm">
                  Premium templates will be available soon
                </p>
              </div>
            </div>
          ) : (
            products.map((product) => (
              <div 
                key={product.id}
                className="group bg-gradient-to-br from-blue-800/30 to-blue-900/20 rounded-3xl p-4 cursor-pointer hover:from-blue-700/40 hover:to-blue-800/30 transition-all duration-500 border border-blue-700 border-opacity-20 hover:border-cyan-500 hover:border-opacity-30 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-900/20 transform hover:-translate-y-1"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-600 border-opacity-20 group-hover:border-cyan-500 group-hover:border-opacity-50 transition-all duration-300">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <FiStar className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-100 transition-colors duration-300 truncate">
                          {product.title}
                        </h3>
                        <p className="text-blue-300 text-sm mt-1 line-clamp-2">
                          {product.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 bg-blue-900 bg-opacity-50 px-3 py-1 rounded-full border border-blue-700 border-opacity-30">
                        <FiStar className="w-3 h-3 text-amber-400" />
                        <span className="text-white text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-cyan-400 font-bold text-lg">
                          Rp {product.price?.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-blue-400 text-sm line-through">
                            Rp {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:from-cyan-500 group-hover:to-blue-500 transition-all duration-300 shadow-lg shadow-blue-900/30 group-hover:shadow-cyan-900/40">
                        <FiChevronRight className="w-5 h-5 text-white transform group-hover:translate-x-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating CTA */}
        <div className="fixed bottom-24 right-6 z-20">
          <button className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-900/40 hover:shadow-cyan-900/60 transition-all duration-300 transform hover:scale-110 group border border-cyan-400 border-opacity-30">
            <FiShoppingBag className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;