import { useState } from 'react';
import { ExternalLink, Printer, Calendar } from 'lucide-react';
import orders from '@/data/orders';

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('Oct 11,2023 - Nov 11,2022');

  return (
    <div className="min-h-screen">
      {/* Header and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-2 mb-2">
          <h1 className="text-2xl font-bold text-green-700 mb-0">Order List</h1>
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium whitespace-nowrap">{dateRange}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
          <button className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-full sm:w-fit text-sm shadow-none">
            <Printer className="w-5 h-5" /> PRINT
          </button>
          <select
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white shadow text-sm font-medium min-w-[160px] focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:w-fit"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Processing">On Process</option>
          </select>
        </div>
      </div>
      {/* Recent Orders Card */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-8">
        <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm rounded-xl overflow-hidden">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Order Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(order =>
                  statusFilter === 'all' ? true : order.status === statusFilter
                )
                .map((order, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">{order.product}</td>
                    <td className="px-4 py-3">{order.date}</td>
                    <td className="px-4 py-3">{order.items}</td>
                    <td className="px-4 py-3">{order.price}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <img src={order.avatar} alt={order.customer} className="w-7 h-7 rounded-full object-cover border" />
                      <span>{order.customer}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold 
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 border border-green-400' : ''}
                          ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600 border border-red-400' : ''}
                          ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 border border-yellow-400' : ''}
                        `}
                      >
                      {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="border rounded p-2 hover:bg-gray-100"
                        onClick={() => window.location.href = `/orders/${order.id.replace('#', '')}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}