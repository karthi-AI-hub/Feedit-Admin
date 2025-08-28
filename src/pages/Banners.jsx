import { useRef, useState, useEffect } from 'react';
import { CheckCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { fetchBannersAPI, updateBannerStatusAPI, uploadBannerAPI, deleteBannerAPI } from '../services/bannerService';

export default function Banners() {
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError('');
    try {
      const bannerList = await fetchBannersAPI();
      setImages(bannerList);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError('Failed to fetch banners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newImageFiles = files.map(file => ({
      name: file.name,
      file: file,
      preview: URL.createObjectURL(file),
      active: true,
      isNew: true,
    }));
    setNewImages(prev => [...prev, ...newImageFiles]);
  };

  const handleBrowse = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
  };

  const toggleActive = async (id, currentStatus) => {
    if (saving) return;
    
    try {
      await updateBannerStatusAPI(id, !currentStatus);
      setImages(prev => prev.map(img => img.id === id ? { ...img, active: !img.active } : img));
    } catch (error) {
      console.error("Error updating banner status:", error);
      setError('Failed to update banner status. Please try again.');
    }
  };

  const handleDelete = async (id, imageName, imageUrl) => {
    // Prevent deletion if already deleting or saving
    if (deleting || saving) return;

    // Confirm deletion
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this banner image? This action cannot be undone.`
    );

    if (!isConfirmed) return;

    setDeleting(id);
    setError('');

    try {
      await deleteBannerAPI(id, imageName, imageUrl);
      setImages(prev => prev.filter(img => img.id !== id));
      console.log("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      setError('Failed to delete banner. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = async () => {
    if (newImages.length === 0) return;
    if (saving) return;
    
    setSaving(true);
    setError('');
    try {
      await Promise.all(newImages.map(image => uploadBannerAPI(image)));
      setNewImages([]);
      await fetchBanners();
    } catch (error) {
      console.error("Error saving banners:", error);
      setError('Failed to save banners. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewImages([]);
  }


  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-700 mt-0">Banner</h1>
          <div className="flex items-center gap-4">
            {deleting && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Deleting banner...</span>
              </div>
            )}
            <button
              className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-100 font-semibold w-fit text-sm shadow-none"
              onClick={fetchBanners}
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
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Dropzone */}
          <div className="md:w-1/2 w-full">
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl bg-white flex flex-col items-center justify-center min-h-[220px] cursor-pointer hover:border-green-700 transition"
              onClick={() => !saving && !deleting && fileInputRef.current && fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{ 
                opacity: (saving || deleting) ? 0.6 : 1,
                pointerEvents: (saving || deleting) ? 'none' : 'auto'
              }}
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
              <div className="text-gray-500 text-center text-sm">
                Drop your image here, or browse<br />
                <span className="text-xs text-gray-400">Jpeg, png are allowed</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleBrowse}
              />
            </div>
          </div>
          {/* Uploaded Images List */}
          <div className="md:w-1/2 w-full flex flex-col gap-3">
            {loading ? (
              <div className="text-center py-10">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500">Loading Banners...</p>
                </div>
              </div>
            ) : (
              <>
                {images.map((img) => (
                  <div key={img.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                    <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover rounded-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{img.name}</div>
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      {/* Toggle Switch */}
                      <button
                        className={`w-10 h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${img.active ? 'bg-green-600' : 'bg-gray-300'}`}
                        onClick={() => toggleActive(img.id, img.active)}
                        aria-label={img.active ? 'Set inactive' : 'Set active'}
                        disabled={deleting === img.id}
                      >
                        <span
                          className={`inline-block w-5 h-5 transform rounded-full bg-white shadow transition-transform duration-200 ${img.active ? 'translate-x-4' : 'translate-x-0'}`}
                        />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                        onClick={() => handleDelete(img.id, img.name, img.url)}
                        aria-label="Delete banner"
                        disabled={deleting === img.id || saving}
                      >
                        {deleting === img.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {newImages.map((img, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                    <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                      <img src={img.preview} alt={img.name} className="w-full h-full object-cover rounded-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{img.name}</div>
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      
                      {/* Remove Button for New Images */}
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                        onClick={() => setNewImages(prev => prev.filter((_, index) => index !== i))}
                        aria-label="Remove image"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
          <button 
            onClick={handleSave} 
            className="bg-green-700 text-white rounded-lg px-8 py-2 font-semibold hover:bg-green-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={saving || deleting || newImages.length === 0}
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                SAVING...
              </div>
            ) : (
              'SAVE'
            )}
          </button>
          <button 
            onClick={handleCancel} 
            className="border border-gray-300 rounded-lg px-8 py-2 font-semibold bg-white hover:bg-gray-100 transition w-full sm:w-auto disabled:opacity-50" 
            disabled={saving || deleting}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}