import { useState } from "react";
import { orderStats, bestSelling, recentOrders } from "@/data/dashboard";
import { ShoppingBag, MoreVertical, ArrowUpRight, ExternalLink, Clock, CheckCircle, XCircle, TrendingUp, DollarSign, Package } from "lucide-react";

const filterOptions = [
  { label: "Oct 11,2023 - Nov 11,2023", value: "lastMonth" },
  { label: "Sep 11,2023 - Oct 11,2023", value: "prevMonth" },
];

const statusIcons = {
  "Delivered": <CheckCircle className="w-4 h-4 text-green-500" />,
  "Pending": <Clock className="w-4 h-4 text-yellow-500" />,
  "Cancelled": <XCircle className="w-4 h-4 text-red-500" />
};

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0].value);
  const [activeTimeFrame, setActiveTimeFrame] = useState("MONTHLY");

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-green-700">Dashboard</h1>
      {/* Page Title and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
        <div></div>
        <div className="relative w-full sm:w-auto">
          <select
            className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm appearance-none pr-8 w-full min-w-[160px]"
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Order Stats Cards */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-8 w-full">
        {orderStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex-1 min-w-[220px]"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${index === 0 ? 'bg-green-50' : index === 1 ? 'bg-blue-50' : index === 2 ? 'bg-purple-50' : 'bg-orange-50'}`}> 
                {index === 0 ? <ShoppingBag className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" /> : 
                 index === 1 ? <DollarSign className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" /> : 
                 index === 2 ? <TrendingUp className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" /> : 
                 <Package className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">{stat.amount}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>vs Oct 2023</span>
              {stat.change.includes('+') ? 
                <ArrowUpRight className="w-3 h-3 text-green-500" /> : 
                <ArrowUpRight className="w-3 h-3 text-red-500 transform rotate-90" />}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + Best Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-8">
        {/* Sales Graph */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-6 gap-2 sm:gap-3">
            <div>
              <h2 className="font-bold text-base sm:text-lg text-gray-800">Sales Overview</h2>
              <p className="text-xs sm:text-sm text-gray-500">Total performance for selected period</p>
            </div>
            <div className="flex gap-1 sm:gap-2 bg-gray-100 p-0.5 sm:p-1 rounded-lg text-xs sm:text-sm">
              {['WEEKLY', 'MONTHLY', 'YEARLY'].map((timeFrame) => (
                <button
                  key={timeFrame}
                  className={`px-2 sm:px-3 py-1 rounded-md transition font-medium focus:outline-none ${activeTimeFrame === timeFrame ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTimeFrame(timeFrame)}
                >
                  {timeFrame}
                </button>
              ))}
            </div>
          </div>
          <div className="h-40 sm:h-48 md:h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center p-4">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-xs sm:text-sm">Sales chart visualization</p>
            </div>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-3 sm:mb-6">
            <div>
              <h2 className="font-bold text-base sm:text-lg text-gray-800">Best Selling Products</h2>
              <p className="text-xs sm:text-sm text-gray-500">Top products by revenue</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-4">
            {bestSelling.map((product, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200" />
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-600 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-bold text-gray-800">{product.price}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{product.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 sm:mt-6 w-full bg-green-600 text-white text-xs sm:text-sm py-2 rounded-lg hover:bg-green-700 font-medium shadow-sm transition flex items-center justify-center gap-1 sm:gap-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            VIEW FULL REPORT
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="p-2 sm:p-6 pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4 gap-2">
            <div>
              <h2 className="font-bold text-base sm:text-lg text-gray-800">Recent Orders</h2>
              <p className="text-xs sm:text-sm text-gray-500">Latest customer transactions</p>
            </div>
            <button className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium text-left sm:text-right">
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Order ID</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Product</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Date</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Items</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Price</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Customer</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Status</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-2 sm:px-6 sm:py-4 font-medium text-gray-900 whitespace-nowrap">{order.id}</td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-gray-700 whitespace-nowrap">{order.product}</td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-gray-500 whitespace-nowrap">{order.date}</td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-gray-700 whitespace-nowrap">{order.items}</td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 font-medium text-gray-900 whitespace-nowrap">{order.price}</td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-gray-700 whitespace-nowrap">{order.customer}</td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {statusIcons[order.status]}
                    <span
                        className={`font-medium px-2 py-1 rounded-full text-[10px] sm:text-xs
                          ${order.status && order.status.toLowerCase() === "delivered" ? "bg-green-100 text-green-700 border border-green-400" :
                            order.status && (order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "on process") ? "bg-yellow-100 text-yellow-800 border border-yellow-400" :
                            order.status && order.status.toLowerCase() === "cancelled" ? "bg-red-100 text-red-600 border border-red-400" :
                            "bg-gray-100 text-gray-700 border border-gray-300"}
                        `}
                    >
                      {order.status}
                    </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
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
        </div>
        <div className="px-2 sm:px-6 py-2 sm:py-3 border-t border-gray-200 bg-gray-50 text-right">
          <p className="text-xs text-gray-500">Showing 5 of {recentOrders.length} orders</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;