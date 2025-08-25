import { useState, useEffect } from "react";
import { getDashboardSummary, getSalesChartData } from "@/services/dashboardService";
import { ShoppingBag, MoreVertical, ArrowUpRight, ExternalLink, Clock, CheckCircle, XCircle, TrendingUp, DollarSign, Package, Loader2, RefreshCw, Users, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const statusIcons = {
  "DELIVERED": <CheckCircle className="w-4 h-4 text-green-500" />,
  "CONFIRMED": <Clock className="w-4 h-4 text-blue-500" />,
  "PLACED": <Clock className="w-4 h-4 text-yellow-500" />,
  "CANCELLED": <XCircle className="w-4 h-4 text-red-500" />
};

const Dashboard = () => {
  const [activeTimeFrame, setActiveTimeFrame] = useState("MONTHLY");
  const [dashboardData, setDashboardData] = useState({
    orderStats: [],
    bestSelling: [],
    recentOrders: []
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const [data, salesData] = await Promise.all([
        getDashboardSummary(),
        getSalesChartData(activeTimeFrame)
      ]);
      
      setDashboardData(data);
      setChartData(salesData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTimeFrameChange = async (timeFrame) => {
    setActiveTimeFrame(timeFrame);
    try {
      const salesData = await getSalesChartData(timeFrame);
      setChartData(salesData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to update chart data. Please try again.');
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleRetry = () => {
    setError(null);
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="text-center py-10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Welcome back! Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <span>Last updated:</span>
                <span className="font-medium text-gray-700">
                  {lastUpdated.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <button
                className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-fit text-sm shadow-none"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <svg 
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                  style={refreshing ? { animationDirection: 'reverse' } : {}}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Order Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {dashboardData.orderStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg ${index === 0 ? 'bg-green-50' : index === 1 ? 'bg-blue-50' : index === 2 ? 'bg-purple-50' : 'bg-orange-50'}`}> 
                  {index === 0 ? <ShoppingBag className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" /> : 
                   index === 1 ? <Clock className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" /> : 
                   index === 2 ? <CheckCircle className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" /> : 
                   <DollarSign className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-2">{stat.amount}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span>vs previous month</span>
                {stat.change.includes('+') ? 
                  <ArrowUpRight className="w-3 h-3 text-green-500" /> : 
                  <ArrowUpRight className="w-3 h-3 text-red-500 transform rotate-90" />}
              </p>
            </div>
          ))}
        </div>

        {/* Chart + Best Selling */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Sales Graph */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
              <div>
                <h2 className="font-bold text-lg sm:text-xl text-gray-800">Sales Overview</h2>
                <p className="text-xs sm:text-sm text-gray-500">Total performance for selected period</p>
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg text-xs sm:text-sm">
                {['WEEKLY', 'MONTHLY', 'YEARLY'].map((timeFrame) => (
                  <button
                    key={timeFrame}
                    className={`px-2 sm:px-3 py-1 rounded-md transition font-medium focus:outline-none ${activeTimeFrame === timeFrame ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTimeFrameChange(timeFrame)}
                  >
                    {timeFrame}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-48 sm:h-56 md:h-64 bg-white rounded-lg">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#6b7280"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#059669" 
                      strokeWidth={2}
                      dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#059669', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-400 text-xs sm:text-sm">No sales data available</p>
                    <p className="text-gray-300 text-xs mt-1">Sales will appear here once orders are delivered</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h2 className="font-bold text-lg sm:text-xl text-gray-800">Best Selling Products</h2>
                <p className="text-xs sm:text-sm text-gray-500">Top products by revenue</p>
              </div>
              {/* <button className="text-gray-400 hover:text-gray-600 transition">
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button> */}
            </div>
            <div className="space-y-3 sm:space-y-4">
              {dashboardData.bestSelling.length > 0 ? (
                dashboardData.bestSelling.map((product, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4">
                    <div className="relative flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200" />
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-600 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate">{product.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-800">{product.price}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 text-xs sm:text-sm">No sales data available</p>
                  <p className="text-gray-400 text-xs mt-1">Products will appear here once orders are delivered</p>
                </div>
              )}
            </div>
            {/* <button className="mt-4 sm:mt-6 w-full bg-green-600 text-white text-xs sm:text-sm py-2 rounded-lg hover:bg-green-700 font-medium shadow-sm transition flex items-center justify-center gap-2">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              VIEW FULL REPORT
            </button> */}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-3 sm:p-6 pb-2 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
              <div>
                <h2 className="font-bold text-lg sm:text-xl text-gray-800">Recent Orders</h2>
                <p className="text-xs sm:text-sm text-gray-500">Latest customer transactions</p>
              </div>
              <button 
                onClick={() => window.location.href = '/orders'}
                className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                View All Orders
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {dashboardData.recentOrders.length > 0 ? (
              <table className="w-full min-w-[600px] sm:min-w-[800px] text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Order ID</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Product</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Date</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Items</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Price</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Customer</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Status</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 whitespace-nowrap text-xs sm:text-sm">{order.id}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 whitespace-nowrap text-xs sm:text-sm">{order.product}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap text-xs sm:text-sm">{order.date}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 whitespace-nowrap text-xs sm:text-sm">{order.items}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 whitespace-nowrap text-xs sm:text-sm">{order.price}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 whitespace-nowrap text-xs sm:text-sm">{order.customer}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {statusIcons[order.status] || <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />}
                          <span
                            className={`font-medium px-1 sm:px-2 py-1 rounded-full text-xs
                              ${order.status === "DELIVERED" ? "bg-green-100 text-green-700 border border-green-400" :
                                order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700 border border-blue-400" :
                                order.status === "PLACED" ? "bg-yellow-100 text-yellow-800 border border-yellow-400" :
                                order.status === "CANCELLED" ? "bg-red-100 text-red-600 border border-red-400" :
                                "bg-gray-100 text-gray-700 border border-gray-300"}
                            `}
                          >
                            {order.status || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          className="text-gray-400 hover:text-green-600 transition"
                          onClick={() => window.location.href = `/orders/${order.id.replace('#', '')}`}
                          aria-label="View order"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-gray-500 text-xs sm:text-sm">No recent orders found</p>
                <p className="text-gray-400 text-xs mt-1">Orders will appear here once customers place them</p>
              </div>
            )}
          </div>
          {/* {dashboardData.recentOrders.length > 0 && (
            <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200 bg-gray-50 text-right">
              <p className="text-xs text-gray-500">
                Showing {dashboardData.recentOrders.length} of {dashboardData.recentOrders.length} recent orders
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;