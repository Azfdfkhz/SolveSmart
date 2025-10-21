import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';
import { 
  FaFileCsv, 
  FaDownload,
  FaChartBar,
  FaArrowLeft,
  FaCalendarAlt,
  FaFilter,
  FaPrint,
  FaSpinner,
  FaMoneyBillWave,
  FaQrcode,
  FaShoppingCart,
  FaUsers,
  FaDollarSign
} from 'react-icons/fa';

const AdminReports = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { products, loading: productsLoading } = useProduct();
  const { orders, loading: ordersLoading } = useOrder();
  
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [reportStats, setReportStats] = useState(null);

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number function
  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const getStatusText = (status, paymentStatus) => {
    if (status === 'rejected') return 'Ditolak';
    if (status === 'completed') return 'Selesai';
    if (status === 'accepted') return paymentStatus === 'paid' ? 'Diproses' : 'Menunggu Pembayaran';
    if (status === 'pending') return 'Menunggu Konfirmasi';
    return status;
  };

  const filteredOrders = React.useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    return orders.filter(order => {
      if (!dateRange.start && !dateRange.end) return true;
      
      // Handle Firestore timestamp
      let orderDate;
      if (order.createdAt && typeof order.createdAt.toDate === 'function') {
        orderDate = order.createdAt.toDate();
      } else if (order.createdAt) {
        orderDate = new Date(order.createdAt);
      } else {
        return false;
      }
      
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date('2000-01-01');
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
      endDate.setHours(23, 59, 59, 999);
      
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [orders, dateRange]);

  useEffect(() => {
    if (filteredOrders.length > 0) {
      const stats = {
        totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalOrders: filteredOrders.length,
        totalCustomers: new Set(filteredOrders.map(order => order.userEmail)).size,
        completedOrders: filteredOrders.filter(order => order.status === 'completed').length,
        paidOrders: filteredOrders.filter(order => order.paymentStatus === 'paid').length,
        qrisPayments: filteredOrders.filter(order => order.paymentMethod === 'qris').length,
        cashPayments: filteredOrders.filter(order => order.paymentMethod === 'cash').length
      };
      
      stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
      stats.conversionRate = stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0;
      
      setReportStats(stats);
    } else {
      setReportStats({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        completedOrders: 0,
        paidOrders: 0,
        qrisPayments: 0,
        cashPayments: 0,
        averageOrderValue: 0,
        conversionRate: 0
      });
    }
  }, [filteredOrders]);

  const reportData = {
    sales: {
      title: 'Laporan Penjualan',
      description: 'Ringkasan penjualan berdasarkan periode',
      icon: '📊',
      data: generateSalesReport(filteredOrders),
      columns: ['Bulan', 'Pesanan', 'Pendapatan', 'Rata-rata', 'Selesai']
    },
    
    products: {
      title: 'Laporan Produk',
      description: 'Produk terlaris dan performa penjualan',
      icon: '📦',
      data: generateProductReport(filteredOrders),
      columns: ['Produk', 'Terjual', 'Pendapatan', 'Pesanan', 'Rating']
    },
    
    customers: {
      title: 'Laporan Pelanggan',
      description: 'Data pelanggan dan riwayat pembelian',
      icon: '👥',
      data: generateCustomerReport(filteredOrders),
      columns: ['Pelanggan', 'Email', 'Pesanan', 'Total', 'Terakhir']
    },
    
    transactions: {
      title: 'Laporan Transaksi',
      description: 'Detail semua transaksi',
      icon: '💸',
      data: generateTransactionReport(filteredOrders),
      columns: ['Order ID', 'Tanggal', 'Customer', 'Total', 'Status', 'Bayar']
    }
  };

  function generateSalesReport(orders) {
    const monthlyData = {};
    
    orders.forEach(order => {
      let orderDate;
      if (order.createdAt && typeof order.createdAt.toDate === 'function') {
        orderDate = order.createdAt.toDate();
      } else if (order.createdAt) {
        orderDate = new Date(order.createdAt);
      } else {
        return;
      }
      
      const monthYear = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = orderDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          period: monthName,
          orders: 0,
          revenue: 0,
          completed: 0
        };
      }
      
      monthlyData[monthYear].orders++;
      monthlyData[monthYear].revenue += order.totalAmount || 0;
      if (order.status === 'completed') {
        monthlyData[monthYear].completed++;
      }
    });
    
    return Object.values(monthlyData)
      .sort((a, b) => b.period.localeCompare(a.period))
      .map(data => ({
        period: data.period,
        totalOrders: data.orders,
        totalRevenue: data.revenue,
        averageOrder: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
        completedOrders: data.completed
      }));
  }

  function generateProductReport(orders) {
    const productSales = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.title || 'Unknown Product',
            sold: 0,
            revenue: 0,
            orders: 0
          };
        }
        
        productSales[productId].sold += item.quantity || 1;
        productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
        productSales[productId].orders += 1;
      });
    });
    
    products?.forEach(product => {
      if (!productSales[product.id]) {
        productSales[product.id] = {
          name: product.title || 'Unknown Product',
          sold: 0,
          revenue: 0,
          orders: 0
        };
      }
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) 
      .map(product => ({
        name: product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name,
        sold: product.sold,
        revenue: product.revenue,
        orders: product.orders,
        rating: product.sold > 0 ? '4.5' : '0.0'
      }));
  }

  function generateCustomerReport(orders) {
    const customerData = {};
    
    orders.forEach(order => {
      const email = order.userEmail;
      if (!email) return;
      
      if (!customerData[email]) {
        customerData[email] = {
          name: order.userName || 'Unknown Customer',
          email: email,
          orders: 0,
          totalSpent: 0,
          lastOrder: order.createdAt
        };
      }
      
      customerData[email].orders++;
      customerData[email].totalSpent += order.totalAmount || 0;
      
      const currentOrderDate = order.createdAt;
      if (currentOrderDate && (!customerData[email].lastOrder || currentOrderDate > customerData[email].lastOrder)) {
        customerData[email].lastOrder = currentOrderDate;
      }
    });
    
    return Object.values(customerData)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(customer => {
        let lastOrderDate = '-';
        if (customer.lastOrder) {
          if (typeof customer.lastOrder.toDate === 'function') {
            lastOrderDate = customer.lastOrder.toDate().toLocaleDateString('id-ID');
          } else {
            lastOrderDate = new Date(customer.lastOrder).toLocaleDateString('id-ID');
          }
        }
        
        return {
          name: customer.name.length > 20 ? customer.name.substring(0, 20) + '...' : customer.name,
          email: customer.email.length > 25 ? customer.email.substring(0, 25) + '...' : customer.email,
          totalOrders: customer.orders,
          totalSpent: customer.totalSpent,
          lastOrder: lastOrderDate
        };
      });
  }

  function generateTransactionReport(orders) {
    return orders
      .sort((a, b) => {
        const dateA = a.createdAt && typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt && typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 20) 
      .map(order => {
        let orderDate = '-';
        if (order.createdAt) {
          if (typeof order.createdAt.toDate === 'function') {
            orderDate = order.createdAt.toDate().toLocaleDateString('id-ID');
          } else {
            orderDate = new Date(order.createdAt).toLocaleDateString('id-ID');
          }
        }
        
        return {
          id: order.id?.slice(-6).toUpperCase() || 'N/A',
          date: orderDate,
          customer: order.userName && order.userName.length > 15 ? order.userName.substring(0, 15) + '...' : order.userName || '-',
          total: order.totalAmount || 0,
          status: getStatusText(order.status, order.paymentStatus),
          payment: order.paymentStatus === 'paid' ? 'Lunas' : 'Belum'
        };
      });
  }

  const exportToCSV = () => {
    setLoading(true);
    try {
      const data = reportData[reportType].data;
      const headers = reportData[reportType].columns;
      
      let csvContent = '\uFEFF';
      csvContent += headers.join(';') + '\n';
      
      data.forEach(row => {
        const values = Object.values(row).map(value => {
          if (typeof value === 'number') {
            return value.toString().replace('.', ',');
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvContent += values.join(';') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `laporan-${reportType}-${timestamp}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Gagal mengekspor laporan');
      setLoading(false);
    }
  };

  if (user && !isAdmin) {
    navigate('/home');
    return null;
  }

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon, value, label, trend }) => (
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-slate-900 mb-1">{value}</p>
          <p className="text-slate-600 text-sm">{label}</p>
        </div>
        <div className="text-slate-400 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors text-slate-600"
              >
                <FaArrowLeft className="text-sm" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
                <p className="text-slate-600 text-sm">SolveSmart Reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Controls Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Date Range */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dari Tanggal</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sampai Tanggal</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Laporan</label>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white appearance-none"
                >
                  <option value="sales">Laporan Penjualan</option>
                  <option value="products">Laporan Produk</option>
                  <option value="customers">Laporan Pelanggan</option>
                  <option value="transactions">Laporan Transaksi</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                disabled={loading || filteredOrders.length === 0}
                className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaFileCsv className="text-sm" />
                )}
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                disabled={filteredOrders.length === 0}
                className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <FaPrint className="text-sm" />
              </button>
            </div>
          </div>

          {/* Report Info */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{reportData[reportType].icon}</div>
                <div>
                  <h3 className="font-semibold text-slate-900">{reportData[reportType].title}</h3>
                  <p className="text-slate-600 text-sm">{reportData[reportType].description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Periode</p>
                <p className="text-sm font-medium text-slate-900">
                  {dateRange.start && dateRange.end 
                    ? `${new Date(dateRange.start).toLocaleDateString('id-ID')} - ${new Date(dateRange.end).toLocaleDateString('id-ID')}`
                    : 'Semua Data'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {reportStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon={<FaShoppingCart className="text-blue-500" />}
              value={formatNumber(reportStats.totalOrders)}
              label="Total Pesanan"
            />
            <StatCard
              icon={<FaDollarSign className="text-emerald-500" />}
              value={formatCurrency(reportStats.totalRevenue)}
              label="Total Pendapatan"
            />
            <StatCard
              icon={<FaUsers className="text-purple-500" />}
              value={formatNumber(reportStats.totalCustomers)}
              label="Total Pelanggan"
            />
            <StatCard
              icon={<FaChartBar className="text-orange-500" />}
              value={formatCurrency(reportStats.averageOrderValue)}
              label="Rata-rata Pesanan"
            />
            <StatCard
              icon={<FaQrcode className="text-green-500" />}
              value={formatNumber(reportStats.qrisPayments)}
              label="Pembayaran QRIS"
            />
            <StatCard
              icon={<FaMoneyBillWave className="text-blue-500" />}
              value={formatNumber(reportStats.cashPayments)}
              label="Pembayaran Cash"
            />
          </div>
        )}

        {/* Report Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Data Laporan</h3>
              <span className="text-sm text-slate-500">
                {reportData[reportType].data.length} items
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {reportData[reportType].columns.map((column, index) => (
                    <th 
                      key={index} 
                      className="text-left py-4 px-6 text-sm font-semibold text-slate-700 bg-slate-50 whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData[reportType].data.map((row, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {Object.values(row).map((value, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap"
                      >
                        {typeof value === 'number' ? (
                          reportData[reportType].columns[cellIndex].includes('Pendapatan') || 
                          reportData[reportType].columns[cellIndex].includes('Total') ? (
                            <span className="font-medium text-slate-900">
                              {formatCurrency(value)}
                            </span>
                          ) : (
                            <span className="font-medium text-slate-900">
                              {formatNumber(value)}
                            </span>
                          )
                        ) : (
                          <span>{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reportData[reportType].data.length === 0 && (
            <div className="text-center py-12">
              <FaChartBar className="text-4xl text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Tidak ada data untuk ditampilkan</p>
              <p className="text-slate-400 text-xs mt-1">
                {orders.length === 0 ? 'Belum ada transaksi' : 'Coba ubah filter tanggal'}
              </p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center space-x-3 shadow-lg">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-700 font-medium text-sm">Mengekspor laporan...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;