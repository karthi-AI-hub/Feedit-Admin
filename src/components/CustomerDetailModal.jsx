import React from 'react';

export default function CustomerDetailModal({ customer, open, onClose }) {
  if (!customer || !open) return null;
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-auto p-0 z-10 animate-fadeIn border border-green-100">
        {/* Header with gradient */}
        <div className="rounded-t-3xl w-full h-28 bg-gradient-to-r from-green-700 via-green-600 to-green-400 flex flex-col items-center justify-center relative">
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-bold focus:outline-none transition"
            onClick={onClose}
            aria-label="Close"
            tabIndex={0}
          >
            &times;
          </button>
          <img
            src={customer.avatar || '/placeholder.png'}
            alt={customer.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg -mb-12 z-10"
            style={{ marginTop: '2.5rem' }}
          />
        </div>
        <div className="flex flex-col items-center pt-16 pb-2">
          <div className="text-2xl font-bold text-green-700 mb-1">{customer.name || '-'}</div>
          <div className="text-gray-500 text-sm mb-2">{customer.email || '-'}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 px-8 py-6 text-[15px]">
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-800">{customer.number || '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Pin Code:</span> <span className="text-gray-800">{customer.pinCode || '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Reward Points:</span> <span className="text-green-700 font-bold">{customer.rewardPoints ?? '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Total Orders:</span> <span className="text-gray-800">{customer.totalOrders ?? '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Chicken Count:</span> <span className="text-gray-800">{customer.chickenCount ?? '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Chicken Type:</span> <span className="text-gray-800">{customer.chickenType || '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Cow Count:</span> <span className="text-gray-800">{customer.cowCount ?? '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Cow Milk/Day:</span> <span className="text-gray-800">{customer.cowMilkLitresPerDay ?? '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Goat Count:</span> <span className="text-gray-800">{customer.goatCount ?? '-'}</span></div>
          <div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Date Joined:</span> <span className="text-gray-800">{customer.joinDate || '-'}</span></div>
        </div>
        <div className="px-8 pb-8 pt-2 flex justify-end">
          <button className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-green-700 via-green-600 to-green-400 text-white font-semibold shadow hover:from-green-800 hover:to-green-500 transition" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
