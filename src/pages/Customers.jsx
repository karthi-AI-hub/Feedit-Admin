import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { fetchCustomersAPI } from '../services/customerService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const PAGE_SIZE = 10;

  // Fetch customers function for reuse
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const customerList = await fetchCustomersAPI();
      setCustomers(customerList);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const totalPages = Math.ceil(customers.length / PAGE_SIZE);
  const paginated = customers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(paginated.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (id) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to print.');
      return;
    }
    const doc = new jsPDF();
    const tableData = customers
      .filter(c => selectedCustomers.includes(c.id))
      .map(c => [
        c.name ? c.name : '-',
        c.number ? c.number : '-',
        c.email ? c.email : '-',
        c.joinDate ? c.joinDate : '-',
        c.pinCode ? c.pinCode : '-',
        c.totalOrders === 0 ? 0 : c.totalOrders || '-',
        c.rewardPoints !== undefined && c.rewardPoints !== null ? c.rewardPoints : '-',
      ]);
    
    autoTable(doc, {
      head: [['Customer Name', 'Phone', 'Email', 'Date Joined', 'Pin Code', 'Total Orders', 'Reward Points']],
      body: tableData,
    });
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    doc.save(`CX_${day}_${month}_${year}.pdf`);
  };

  // Helper for smart pagination range (show first, last, current, neighbors)
  function getPageNumbers() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (page >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-green-700">Customers</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-fit text-sm shadow-none"
              onClick={fetchCustomers}
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
            <button onClick={handlePrint} className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-fit text-sm shadow-none">
              <Printer className="w-5 h-5" /> PRINT
            </button>
          </div>
        </div>
      </div>

      {/* Table Card - removed green background and extra padding */}
      <div className="rounded-2xl shadow p-0 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center justify-between ml-4 mt-4 mb-4 gap-2 sm:gap-4">
          <span className="font-semibold text-base">{customers.length} customers</span>
        </div>
        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="text-center py-10">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading Customers...</p>
              </div>
            </div>
          ) : (
            <table className="min-w-[900px] w-full table-auto text-xs sm:text-sm rounded-xl overflow-hidden">
              <thead className="bg-[#F5F5F5] text-gray-700">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      onChange={handleSelectAll}
                      checked={selectedCustomers.length === paginated.length && paginated.length > 0}
                    />
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">Customer Name</th>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">Phone</th>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">Date Joined</th>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">Pin Code</th>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">Total Orders</th>
                  <th className="px-2 sm:px-3 py-2 text-left font-medium">Reward Points</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4"
                        checked={selectedCustomers.includes(c.id)}
                        onChange={() => handleSelectCustomer(c.id)}
                      />
                    </td>
                    <td className="px-2 sm:px-3 py-2 flex items-center gap-2 max-w-[140px] truncate">
                      <img src={c.avatar || '/placeholder.svg'} alt={c.name} className="w-7 h-7 rounded-full object-cover border flex-shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">{c.number}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">{c.email}</td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">{c.joinDate}</td>
                    <td className="px-2 sm:px-3 py-2">{c.pinCode}</td>
                    <td className="px-2 sm:px-3 py-2 text-left">{c.totalOrders}</td>
                    <td className="px-2 sm:px-3 py-2 text-left">{c.rewardPoints !== undefined && c.rewardPoints !== null ? c.rewardPoints : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination & Footer always at bottom */}
      <div className="mt-8 flex justify-center items-center flex-wrap gap-2 pb-2">
          <button
            className="w-8 h-8 rounded border bg-white text-gray-700 border-gray-300 hover:bg-green-50 disabled:opacity-50"
            onClick={() => setPage(page-1)}
            disabled={page === 1}
          >&lt;</button>
          {getPageNumbers().map((n, idx) =>
            n === '...'
              ? <span key={idx} className="text-gray-400">...</span>
              : <button
                  key={n}
                  className={`w-8 h-8 rounded border text-sm font-medium ${page===n ? 'bg-green-700 text-white' : 'bg-white text-gray-700 border-gray-300'} hover:bg-green-50`}
                  onClick={() => setPage(n)}
                >{n}</button>
          )}
          <button
            className="w-8 h-8 rounded border bg-white text-gray-700 border-gray-300 hover:bg-green-50 disabled:opacity-50"
            onClick={() => setPage(page+1)}
            disabled={page === totalPages}
          >&gt;</button>
      </div>
    </div>
  );
}