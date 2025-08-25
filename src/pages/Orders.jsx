import { useState, useEffect } from 'react';
import { ExternalLink, Printer } from 'lucide-react';
import { fetchOrdersAPI } from '../services/ordersService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch orders function for reuse
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrdersAPI();
      // console.log('Fetched orders from Firestore:', data);
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header and Filters */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-green-700">Order List</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 bg-white shadow text-sm font-medium min-w-[160px] focus:outline-none focus:ring-2 focus:ring-green-200 w-full sm:w-fit"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-fit text-sm shadow-none"
              onClick={fetchOrders}
              disabled={loading}
            >
              <svg 
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
                style={loading ? { animationDirection: 'reverse' } : {}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
            {/* <button className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-fit text-sm shadow-none">
              <Printer className="w-5 h-5" /> PRINT
            </button> */}
          </div>
        </div>
      </div>
      {/* Recent Orders Card */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-8">
        <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading Orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
              >
                Retry
              </button>
            </div>
          ) : (
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
                  .filter(order => {
                    const status = (order.orderStatus || '-').toLowerCase();
                    return statusFilter === 'all' ? true : status === statusFilter;
                  })
                  .map((order, i) => {
                    // Map Firestore fields to UI fields
                    const productName = order.product?.name || '-';
                    // Format orderDate if it's a Firestore timestamp or number
                    let orderDate = '-';
                    if (order.orderDate) {
                      if (typeof order.orderDate === 'object' && order.orderDate.seconds) {
                        // Firestore Timestamp object
                        orderDate = new Date(order.orderDate.seconds * 1000).toLocaleDateString();
                      } else if (!isNaN(order.orderDate)) {
                        // Numeric timestamp
                        orderDate = new Date(Number(order.orderDate)).toLocaleDateString();
                      } else {
                        orderDate = order.orderDate;
                      }
                    }
                    const items = order.product?.cartQuantity ?? '-';
                    const price = order.totalSubPrice ?? '-';
                    const customer = order.address ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() : '-';
                    const status = order.orderStatus || '-';
                    const avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(customer || 'Customer');
                    // Use Firestore doc id for navigation
                    const orderDocId = order.id;
                    return (
                      <tr key={orderDocId || i} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{orderDocId}</td>
                        <td className="px-4 py-3">{productName}</td>
                        <td className="px-4 py-3">{orderDate}</td>
                        <td className="px-4 py-3">{items}</td>
                        <td className="px-4 py-3">{price}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <img src={avatar} alt={customer} className="w-7 h-7 rounded-full object-cover border" />
                          <span>{customer}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold 
                              ${status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700 border border-green-400' : ''}
                              ${status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-600 border border-red-400' : ''}
                              ${status.toLowerCase() === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-400' : ''}
                              ${status.toLowerCase() === 'placed' ? 'bg-yellow-100 text-yellow-800 border border-yellow-400' : ''}
                            `}
                          >
                          {status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="border rounded p-2 hover:bg-gray-100"
                            onClick={() => window.location.href = `/orders/${orderDocId}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}