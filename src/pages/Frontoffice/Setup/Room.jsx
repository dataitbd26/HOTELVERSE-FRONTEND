import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useRoom } from "../../../Hook/useRoom";
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";
import PageHeader from "../../../components/PageHeader";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaExclamationCircle, FaBed,
  FaTags, FaFilter
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const defaultFormState = { 
  roomName: "", 
  roomCategory: "",
  bookingStatus: "vacant",
  roomSituation: "clear",
  roomPhoto: ""
};

const RoomsManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllRooms, 
    createRoom, 
    updateRoom, 
    removeRoom, 
    getRoomCategories,
    loading 
  } = useRoom();

  // State Management
  const [roomsList, setRoomsList] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // Top bar filter state
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(defaultFormState);

  // --- Search Debounce Logic ---
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch !== searchInput) {
        setDebouncedSearch(searchInput);
        setCurrentPage(1); 
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, debouncedSearch]);

  // --- Data Fetching ---
  const loadRooms = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllRooms({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
        category: filterCategory, // Applied top bar filter
        branch: userBranch 
      });
      
      if (data) {
        setRoomsList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load rooms");
    }
  }, [getAllRooms, currentPage, itemsPerPage, debouncedSearch, filterCategory, userBranch]);

  const loadCategories = useCallback(async () => {
    if (!userBranch) return;
    try {
      const response = await getRoomCategories(userBranch);
      setCategoryOptions(response.data || response || []);
    } catch (error) {
      console.error("Could not load categories", error);
    }
  }, [getRoomCategories, userBranch]);

  useEffect(() => { 
    loadRooms(); 
  }, [loadRooms]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // --- Handlers ---
  const handleOpenModal = useCallback((room = null) => {
    setErrors({}); 
    if (room) {
      setEditingId(room._id);
      setFormData({ 
        roomName: room.roomName, 
        roomCategory: typeof room.roomCategory === 'object' ? room.roomCategory?._id : room.roomCategory,
        bookingStatus: room.bookingStatus || "vacant",
        roomSituation: room.roomSituation || "clear",
        roomPhoto: room.roomPhoto || ""
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData(defaultFormState);
      setErrors({});
    }, 200);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomName.trim()) newErrors.roomName = "Room Name is required.";
    if (!formData.roomCategory) newErrors.roomCategory = "Room Category is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userBranch) return toast.error("User branch not found.");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { 
        roomName: formData.roomName.trim(), 
        roomCategory: formData.roomCategory, 
        bookingStatus: formData.bookingStatus,
        roomSituation: formData.roomSituation,
        roomPhoto: formData.roomPhoto.trim(),
        branch: userBranch 
      };
      
      if (editingId) {
        await updateRoom(editingId, payload);
        toast.success("Room updated successfully");
      } else {
        await createRoom(payload);
        toast.success("Room created successfully");
      }
      
      handleCloseModal();
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Execution failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3d4451",
      confirmButtonText: "Yes, delete",
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#f3f4f6' : '#374151',
    });

    if (result.isConfirmed) {
      try {
        await removeRoom(id);
        toast.success("Deleted successfully");
        if (roomsList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadRooms();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeRoom, loadRooms, roomsList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Rooms Management | Admin Dashboard</title>
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Rooms" 
          subtitle="Manage hotel rooms, categories, and statuses" 
          icon={<FaBed className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} aria-hidden="true" /> Add Room
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            
            {/* Search Box */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label htmlFor="searchRoom" className="text-sm font-bold hidden sm:block">Search</label>
              <input 
                id="searchRoom"
                type="search"
                className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-64 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all"
                placeholder="Search room name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Top Dropdown Filter */}
            <div className="flex items-center gap-3 w-full sm:w-auto relative">
              <FaFilter className="text-slate-400 absolute left-3 pointer-events-none" size={12} />
              <select 
                className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded pl-8 pr-3 py-1.5 text-sm w-full sm:w-56 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all cursor-pointer appearance-none"
                value={filterCategory}
                onChange={(e) => { 
                  setFilterCategory(e.target.value); 
                  setCurrentPage(1); 
                }}
              >
                <option value="">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName || cat.name || "Unknown Category"}
                  </option>
                ))}
              </select>
            </div>

          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <label htmlFor="rowsPerPage" className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rows:</label>
             <select 
               id="rowsPerPage"
               className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-xs outline-none cursor-pointer"
               value={itemsPerPage}
               onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             >
               {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                 <option key={opt} value={opt}>{opt}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto p-5 min-h-[400px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-gray-700 text-[#1f2937] dark:text-gray-100 font-bold border border-slate-300 dark:border-gray-600">
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Room Info</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Status & Situation</th>
                <th scope="col" className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="3" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : roomsList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-24 text-center border-x border-slate-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaBed size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No rooms found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                roomsList.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-base text-[#66cc00]">{room.roomName}</span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <FaTags size={10}/> {room.roomCategory?.categoryName || "Unknown Category"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          room.bookingStatus === 'occupied' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          room.bookingStatus === 'vacant' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {room.bookingStatus}
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
                          Situation: {room.roomSituation}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 text-right align-top">
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button 
                          onClick={() => handleOpenModal(room)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit Room"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(room._id)} 
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete Room"
                        >
                          <FaTrash size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 dark:text-gray-300">
            <div className="text-xs font-bold uppercase">
              Showing <span className="text-[#66cc00]">{roomsList.length}</span> of {totalItems} Results
            </div>
            <div className="flex items-center gap-1 join" aria-label="Pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-l border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft size={10} />
              </button>
              {paginationRange.map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="px-2 text-slate-400 font-bold">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold transition-colors ${
                      currentPage === pageNum ? "bg-[#66cc00] text-white border-[#66cc00]" : "bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded-r border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl animate-slide-in-right p-6 overflow-y-auto flex flex-col">
            
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-gray-700 pb-4 shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaBed className="text-[#66cc00]" /> {editingId ? "Edit Room" : "New Room"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="flex-1 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Room Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. 101"
                      className={`w-full border ${errors.roomName ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                      value={formData.roomName}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, roomName: e.target.value }));
                        if (errors.roomName) setErrors(prev => ({ ...prev, roomName: null }));
                      }}
                    />
                    {errors.roomName && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.roomName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className={`w-full border ${errors.roomCategory ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all cursor-pointer`}
                      value={formData.roomCategory}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, roomCategory: e.target.value }));
                        if (errors.roomCategory) setErrors(prev => ({ ...prev, roomCategory: null }));
                      }}
                    >
                      <option value="" disabled>Select a category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryName || cat.name || "Unknown Category"}
                        </option>
                      ))}
                    </select>
                    {errors.roomCategory && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.roomCategory}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Booking Status
                    </label>
                    <select 
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#66cc00] transition-all cursor-pointer"
                      value={formData.bookingStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookingStatus: e.target.value }))}
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Room Situation
                    </label>
                    <select 
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#66cc00] transition-all cursor-pointer"
                      value={formData.roomSituation}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomSituation: e.target.value }))}
                    >
                      <option value="clear">Clear</option>
                      <option value="stay over">Stay Over</option>
                      <option value="due out">Due out</option>
                      <option value="cleared">Cleared</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                    Photo URL (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#66cc00] transition-all"
                    value={formData.roomPhoto}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomPhoto: e.target.value }))}
                  />
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="pt-6 mt-auto flex gap-3 border-t border-slate-100 dark:border-gray-700">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-gray-600 rounded font-bold text-sm hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-3 rounded font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center"
                >
                  {isSubmitting ? "Processing..." : editingId ? "Update Room" : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsManager;