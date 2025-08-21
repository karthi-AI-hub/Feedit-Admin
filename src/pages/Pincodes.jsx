import { useRef, useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';
import { fetchPincodesAPI, addPincodeAPI, updatePincodeStatusAPI, deletePincodeAPI } from '../services/pincodeService';

export default function Pincodes() {
  const [pincodes, setPincodes] = useState([]);
  const [newPincode, setNewPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const fetchPincodes = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchPincodesAPI();
      setPincodes(list);
    } catch (error) {
      setError('Failed to fetch pincodes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  const handleAdd = async () => {
    if (!newPincode.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      const added = await addPincodeAPI(newPincode.trim());
      setPincodes(prev => [added, ...prev]);
      setNewPincode('');
    } catch (error) {
      setError('Failed to add pincode. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    if (saving) return;
    try {
      await updatePincodeStatusAPI(id, !currentStatus);
      setPincodes(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    } catch (error) {
      setError('Failed to update pincode status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (deleting || saving) return;
    const isConfirmed = window.confirm('Are you sure you want to delete this pincode? This action cannot be undone.');
    if (!isConfirmed) return;
    setDeleting(id);
    setError('');
    try {
      await deletePincodeAPI(id);
      setPincodes(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      setError('Failed to delete pincode. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto w-full px-2 sm:px-4 md:px-0 py-6 md:py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-8 border border-gray-100">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-green-700 tracking-tight text-left">Delivery Pincodes</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 text-left">Manage serviceable delivery pincodes for your business.</p>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                {deleting && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-medium">Deleting...</span>
                  </div>
                )}
                <button
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 font-medium text-sm shadow-sm transition"
                  onClick={fetchPincodes}
                  disabled={loading || deleting}
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
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
              <input
                ref={inputRef}
                type="text"
                className="border border-gray-200 rounded-lg px-4 py-2 w-full sm:w-48 focus:outline-none focus:border-green-600 text-base transition"
                placeholder="Enter new pincode"
                value={newPincode}
                onChange={e => setNewPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
                disabled={saving}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
              <button
                className="bg-green-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-green-700 transition disabled:opacity-50 w-full sm:w-auto"
                onClick={handleAdd}
                disabled={saving || !newPincode.trim()}
                style={{ minWidth: 90 }}
              >
                <Plus className="w-5 h-5 inline-block mr-1 align-text-bottom" /> <span className="hidden xs:inline">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-0 sm:p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading Pincodes...</p>
              </div>
            </div>
          ) : pincodes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-base">No pincodes found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pincodes.map((p) => (
                <div key={p.id} className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 py-4 px-2 sm:px-4">
                  <div className="font-mono text-lg w-full md:w-32 text-gray-800 text-left md:text-center tracking-wider break-all">{p.pincode}</div>
                  <div className="flex-1 min-w-0 mb-2 md:mb-0">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${p.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-row gap-2 w-full md:w-auto">
                    <button
                      className={`w-10 h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${p.active ? 'bg-green-600' : 'bg-gray-300'}`}
                      onClick={() => toggleActive(p.id, p.active)}
                      aria-label={p.active ? 'Set inactive' : 'Set active'}
                      disabled={deleting === p.id}
                      tabIndex={0}
                    >
                      <span
                        className={`inline-block w-5 h-5 transform rounded-full bg-white shadow transition-transform duration-200 ${p.active ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                      onClick={() => handleDelete(p.id)}
                      aria-label="Delete pincode"
                      disabled={deleting === p.id || saving}
                      tabIndex={0}
                    >
                      {deleting === p.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
