import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useBlockRoom } from "../..//Hook/useBlockRoom"; 
import SkeletonLoader from "../../components/SkeletonLoader";
import useAuth from "../../Hook/useAuth";
import { getPaginationRange } from "../../utilities/paginationUtils";
import PageHeader from "../../components/PageHeader";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaExclamationCircle, 
  FaBan, FaCalendarAlt
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const initialFormState = {
  roomNumber: "",
  dateFrom: "",
  dateTo: "",
  reason: ""
};

const BlockRoomManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllBlockRooms, 
    createBlockRoom, 
    updateBlockRoom, 
    removeBlockRoom, 
    loading 
  } = useBlockRoom();

  // --- State Management ---
  const [blockRoomsList, setBlockRoomsList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormState);

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
  const loadBlockRooms = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllBlockRooms({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
      });
      
      if (data) {
        setBlockRoomsList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load block rooms");
    }
  }, [getAllBlockRooms, currentPage, itemsPerPage, debouncedSearch, userBranch]);

  useEffect(() => { 
    loadBlockRooms(); 
  }, [loadBlockRooms]);

  // --- Handlers ---
  const handleOpenModal = useCallback((room = null) => {
    setErrors({}); 
    if (room) {
      setEditingId(room._id);
      setFormData({
        roomNumber: room.roomNumber || "",
        dateFrom: room.dateFrom ? new Date(room.dateFrom).toISOString().split('T')[0] : "",
        dateTo: room.dateTo ? new Date(room.dateTo).toISOString().split('T')[0] : "",
        reason: room.reason || ""
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData(initialFormState);
      setErrors({});
    }, 200);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomNumber.trim()) newErrors.roomNumber = "Room Number is required.";
    if (!formData.dateFrom) newErrors.dateFrom = "Start Date is required.";
    if (!formData.dateTo) newErrors.dateTo = "End Date is required.";
    if (formData.dateFrom && formData.dateTo && new Date(formData.dateFrom) > new Date(formData.dateTo)) {
        newErrors.dateTo = "End Date cannot be before Start Date.";
    }
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userBranch) return toast.error("User branch not found. Please log in again.");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData,
      };
      
      if (editingId) {
        await updateBlockRoom(editingId, payload);
        toast.success("Blocked room updated successfully");
      } else {
        await createBlockRoom(payload);
        toast.success("Room blocked successfully");
      }
      
      handleCloseModal();
      loadBlockRooms();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Execution failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "This action cannot be undone. It will remove the block from this room.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", 
      cancelButtonColor: "#6b7280", 
      confirmButtonText: "Yes, delete",
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#f3f4f6' : '#374151',
    });

    if (result.isConfirmed) {
      try {
        await removeBlockRoom(id);
        toast.success("Deleted successfully");
        if (blockRoomsList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadBlockRooms();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeBlockRoom, loadBlockRooms, blockRoomsList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Block Rooms Management | Admin Dashboard</title>
        <meta name="description" content="Manage blocked rooms and their reasons." />
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Block Rooms" 
          subtitle="Manage room blocks and out-of-order statuses" 
          icon={<FaBan className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} aria-hidden="true" /> Block Room
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
                placeholder="Search room number or reason..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
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
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Room Number</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Duration</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Reason</th>
                <th scope="col" className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px] w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : blockRoomsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center border-x border-slate-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaBan size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No blocked rooms found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                blockRoomsList.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <span className="font-semibold text-base text-[#66cc00]">
                        {room.roomNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-300 text-sm">
                        <span className="flex items-center gap-2">
                          <FaCalendarAlt className="text-slate-400 text-xs" /> {new Date(room.dateFrom).toLocaleDateString()} - {new Date(room.dateTo).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {room.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 text-right align-top">
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button 
                          onClick={() => handleOpenModal(room)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(room._id)} 
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
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
              Showing <span className="text-[#66cc00]">{blockRoomsList.length}</span> of {totalItems} Results
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
                      currentPage === pageNum
                        ? "bg-[#66cc00] text-white border-[#66cc00]"
                        : "bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600"
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
                <FaBan className="text-[#66cc00]" /> {editingId ? "Edit Blocked Room" : "Block New Room"}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="flex-1 space-y-6">
                
                {/* Room Number */}
                <div>
                  <label htmlFor="roomNumber" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    placeholder="e.g. 101"
                    className={`w-full border ${errors.roomNumber ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all`}
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                  />
                  {errors.roomNumber && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.roomNumber}</p>}
                </div>

                {/* Date From */}
                <div>
                  <label htmlFor="dateFrom" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Date From <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="dateFrom"
                    name="dateFrom"
                    type="date"
                    className={`w-full border ${errors.dateFrom ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all`}
                    value={formData.dateFrom}
                    onChange={handleInputChange}
                  />
                  {errors.dateFrom && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.dateFrom}</p>}
                </div>

                {/* Date To */}
                <div>
                  <label htmlFor="dateTo" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Date To <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="dateTo"
                    name="dateTo"
                    type="date"
                    className={`w-full border ${errors.dateTo ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all`}
                    value={formData.dateTo}
                    onChange={handleInputChange}
                  />
                  {errors.dateTo && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.dateTo}</p>}
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="reason"
                    name="reason"
                    rows="3"
                    placeholder="Provide a reason for blocking the room..."
                    className={`w-full border ${errors.reason ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all resize-none`}
                    value={formData.reason}
                    onChange={handleInputChange}
                  ></textarea>
                  {errors.reason && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.reason}</p>}
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
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : editingId ? "Update Record" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockRoomManager;