import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet"; // Added for SEO
import { useHouseKeepingStatus } from "../../../Hook/useHouseKeepingStatus";
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";
import PageHeader from "../../../components/PageHeader";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronDown, FaChevronLeft, FaChevronRight, FaExclamationCircle, FaBroom
} from "react-icons/fa";
import { HiCheck, HiX } from "react-icons/hi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];
const DEFAULT_COLOR = "#66cc00";

const HouseKeepingStatusManager = () => {
  const { user } = useAuth();
  const branchName = user?.branch;

  const { 
    getSuperAdminHouseKeepingStatuses, 
    createHouseKeepingStatus, 
    updateHouseKeepingStatus, 
    removeHouseKeepingStatus, 
    loading 
  } = useHouseKeepingStatus();

  // State Management
  const [statuses, setStatuses] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // Validation errors state
  const [formData, setFormData] = useState({ 
    name: "", 
    colorCode: DEFAULT_COLOR, 
    isDirty: false 
  });

  // --- Search Debounce Logic ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // --- Data Fetching ---
  const loadStatuses = useCallback(async () => {
    if (!branchName) return; 

    try {
      const data = await getSuperAdminHouseKeepingStatuses({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch 
      });
      
      if (data) {
        setStatuses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load statuses");
    }
  }, [getSuperAdminHouseKeepingStatuses, currentPage, itemsPerPage, debouncedSearch, branchName]);

  useEffect(() => { 
    loadStatuses(); 
  }, [loadStatuses]);

  // --- Handlers ---
  const handleOpenModal = useCallback((status = null) => {
    setErrors({}); // Clear previous errors
    if (status) {
      setEditingId(status._id);
      setFormData({ 
        name: status.name, 
        colorCode: status.colorCode || DEFAULT_COLOR, 
        isDirty: Boolean(status.isDirty)
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", colorCode: DEFAULT_COLOR, isDirty: false });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData({ name: "", colorCode: DEFAULT_COLOR, isDirty: false });
      setErrors({});
    }, 200);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Status Name is required.";
    } else if (formData.name.length < 3) {
      newErrors.name = "Status Name must be at least 3 characters.";
    }
    if (!/^#[0-9A-Fa-f]{6}$/i.test(formData.colorCode)) {
      newErrors.colorCode = "Please enter a valid Hex color code.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchName) {
      toast.error("User branch not found. Please log in again.");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...formData, name: formData.name.trim(), branch: branchName };
      
      if (editingId) {
        await updateHouseKeepingStatus(editingId, payload);
        toast.success("Configuration updated successfully");
      } else {
        await createHouseKeepingStatus(payload);
        toast.success("Status created successfully");
      }
      
      handleCloseModal();
      loadStatuses();
    } catch (err) {
      toast.error(err.response?.data?.error || "Execution failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "This action cannot be undone. It will be removed from all branch records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      // Integrating Tailwind directly into SweetAlert via custom classes
      customClass: {
        popup: 'dark:bg-slate-800 dark:text-slate-100 rounded-2xl border dark:border-slate-700 shadow-2xl',
        title: 'text-xl font-bold dark:text-white text-slate-800',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg ml-3 transition-colors',
        cancelButton: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-6 rounded-lg transition-colors',
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      try {
        await removeHouseKeepingStatus(id);
        toast.success("Deleted successfully");
        if (statuses.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadStatuses();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || "Delete failed"); 
      }
    }
  }, [removeHouseKeepingStatus, loadStatuses, statuses.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-6 text-slate-800 dark:text-slate-200 transition-colors duration-300 relative overflow-hidden font-sans">
      
      {/* SEO Helmet */}
      <Helmet>
        <title>Housekeeping Status Management | Admin Dashboard</title>
        <meta name="description" content="Manage and configure hotel housekeeping statuses, color codes, and room cleaning indicators." />
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
       
   <PageHeader 
     title="House Keeping Status" 
     subtitle="System Setup / Status Configuration" 
     icon={<FaBroom className="text-[#66cc00]" />} 
   />







        <button 
          onClick={() => handleOpenModal()}
          aria-label="Create new status"
          className="bg-[#66cc00] hover:bg-[#52a300] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#66cc00]/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 focus:ring-4 focus:ring-[#66cc00]/50"
        >
          <FaPlus size={14} aria-hidden="true" /> Create Status
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="searchStatus" className="text-sm font-bold text-slate-700 dark:text-slate-300">Search</label>
            <input 
              id="searchStatus"
              type="search"
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 text-sm w-full sm:w-80 focus:ring-2 focus:ring-[#66cc00] focus:border-transparent outline-none transition-all dark:text-white text-slate-900"
              placeholder="Filter by status name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
             <label htmlFor="rowsPerPage" className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Rows per page:</label>
             <select 
               id="rowsPerPage"
               className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-[#66cc00]"
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
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Name</th>
                <th scope="col" className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Color Code</th>
                <th scope="col" className="px-6 py-4 text-center border-b border-slate-200 dark:border-slate-700">Requires Cleaning</th>
                <th scope="col" className="px-6 py-4 text-right border-b border-slate-200 dark:border-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20"><SkeletonLoader /></td></tr>
              ) : statuses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <FaBroom size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No configurations found</p>
                      <p className="text-sm mt-1">Try adjusting your search or create a new status.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                statuses.map((status) => (
                  <tr key={status._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{status.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 shadow-sm" 
                          style={{ backgroundColor: status.colorCode }} 
                          aria-label={`Color ${status.colorCode}`}
                        />
                        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {status.colorCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {status.isDirty ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          <HiCheck className="text-xl font-bold" aria-label="Yes" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <HiX className="text-xl font-bold" aria-label="No" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenModal(status)} 
                          className="p-2 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(status._id)} 
                          className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={16} />
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
          <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{statuses.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> results
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1" aria-label="Pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft size={12} />
              </button>

              {paginationRange.map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="px-3 text-slate-400 font-bold">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                    className={`min-w-[32px] h-8 rounded-md text-sm font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#66cc00] text-white shadow-md"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                aria-label="Next page"
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Modal (Glassmorphism + Modern styling) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in-right flex flex-col border-l border-slate-200 dark:border-slate-800">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Status" : "New Configuration"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure properties for this housekeeping status</p>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-all"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex-1 space-y-6">
                
                {/* Name Input */}
                <div>
                  <label htmlFor="statusName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Status Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="statusName"
                    type="text"
                    maxLength={50}
                    className={`w-full border ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:ring-[#66cc00]/20 focus:border-[#66cc00]'} bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none transition-all shadow-sm`}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                    }}
                    placeholder="e.g., Cleaning in Progress"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.name}</p>
                  )}
                </div>

                {/* Color Input */}
                <div>
                  <label htmlFor="colorCode" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Identify Color Indicator</label>
                  <div className={`flex gap-4 items-center bg-white dark:bg-slate-800 p-3 rounded-xl border ${errors.colorCode ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} shadow-sm transition-all`}>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm shrink-0">
                      <input 
                        id="colorPicker"
                        type="color"
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        value={formData.colorCode}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, colorCode: e.target.value }));
                          if (errors.colorCode) setErrors(prev => ({ ...prev, colorCode: null }));
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        id="colorCode"
                        type="text"
                        className="w-full bg-transparent font-mono text-sm uppercase text-slate-900 dark:text-white outline-none placeholder-slate-400"
                        value={formData.colorCode}
                        placeholder="#HEXCODE"
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, colorCode: e.target.value }));
                          if (errors.colorCode) setErrors(prev => ({ ...prev, colorCode: null }));
                        }}
                      />
                    </div>
                  </div>
                  {errors.colorCode && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.colorCode}</p>
                  )}
                </div>

                {/* Is Dirty Toggle */}
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label htmlFor="isDirtyToggle" className="font-bold text-sm text-slate-900 dark:text-white block cursor-pointer">Requires Cleaning</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mark true if this status means the room needs housekeeping.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      id="isDirtyToggle" 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isDirty}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDirty: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#66cc00]/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#66cc00]"></div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-8 mt-auto flex gap-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#66cc00] hover:bg-[#52a300] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#66cc00]/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Saving...
                    </span>
                  ) : editingId ? "Save Changes" : "Create Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseKeepingStatusManager;