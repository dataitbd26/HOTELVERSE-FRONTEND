import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useHouseKeeper } from "../../../Hook/useHousekeeper";
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";
import PageHeader from "../../../components/PageHeader";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaExclamationCircle, FaUserTie,
  FaPhone, FaGlobe
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const HouseKeepersManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllHouseKeepers, 
    createHouseKeeper, 
    updateHouseKeeper, 
    removeHouseKeeper, 
    loading 
  } = useHouseKeeper();

  // State Management
  const [houseKeepers, setHouseKeepers] = useState([]);
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
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    language: ""
  });

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
  const loadHouseKeepers = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllHouseKeepers({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
        branch: userBranch 
      });
      
      if (data) {
        setHouseKeepers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load house keepers");
    }
  }, [getAllHouseKeepers, currentPage, itemsPerPage, debouncedSearch, userBranch]);

  useEffect(() => { 
    loadHouseKeepers(); 
  }, [loadHouseKeepers]);

  // --- Handlers ---
  const handleOpenModal = useCallback((keeper = null) => {
    setErrors({}); 
    if (keeper) {
      setEditingId(keeper._id);
      setFormData({ 
        name: keeper.name, 
        phone: keeper.phone, 
        language: keeper.language
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", phone: "", language: "" });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData({ name: "", phone: "", language: "" });
      setErrors({});
    }, 200);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required.";
    else if (formData.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters.";
    
    // Bangladesh Phone Number Validation
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    const phoneInput = formData.phone.trim();
    if (!phoneInput) newErrors.phone = "Phone number is required.";
    else if (!bdPhoneRegex.test(phoneInput)) newErrors.phone = "Must be a valid BD number (e.g. 017XXXXXXXX).";
    
    if (!formData.language.trim()) newErrors.language = "Language is required.";
    
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
        name: formData.name.trim(), 
        phone: formData.phone.trim(), 
        language: formData.language.trim(), 
        branch: userBranch 
      };
      
      if (editingId) {
        await updateHouseKeeper(editingId, payload);
        toast.success("House Keeper updated successfully");
      } else {
        await createHouseKeeper(payload);
        toast.success("House Keeper registered successfully");
      }
      
      handleCloseModal();
      loadHouseKeepers();
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
      text: "This action cannot be undone. It will remove the staff member from all records.",
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
        await removeHouseKeeper(id);
        toast.success("Deleted successfully");
        if (houseKeepers.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadHouseKeepers();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeHouseKeeper, loadHouseKeepers, houseKeepers.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Housekeepers Management | Admin Dashboard</title>
        <meta name="description" content="Manage hotel staff, housekeepers, languages, and assigned branches." />
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="House Keepers" 
          subtitle="Manage staff, languages, and assignments" 
          icon={<FaUserTie className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          aria-label="Create new house keeper"
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} aria-hidden="true" /> Add Staff
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="searchKeeper" className="text-sm font-bold">Search</label>
            <input 
              id="searchKeeper"
              type="search"
              className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-72 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all"
              placeholder="Filter by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
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
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Staff Name</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Contact & Language</th>
                <th scope="col" className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="3" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : houseKeepers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-24 text-center border-x border-slate-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaUserTie size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No housekeepers found</p>
                      <p className="text-sm mt-1">Try adjusting your search or add a new staff member.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                houseKeepers.map((keeper) => (
                  <tr key={keeper._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700">
                      <div className="font-semibold text-base">{keeper.name}</div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <FaPhone className="text-[#66cc00] text-xs" /> {keeper.phone}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <FaGlobe className="text-slate-400 text-xs" /> {keeper.language}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(keeper)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit Staff"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(keeper._id)} 
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete Staff"
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
              Showing <span className="text-[#66cc00]">{houseKeepers.length}</span> of {totalItems} Results
            </div>
            <div className="flex items-center gap-1 join" aria-label="Pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                aria-label="Previous page"
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
                    aria-current={currentPage === pageNum ? "page" : undefined}
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
                aria-label="Next page"
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
                <FaUserTie className="text-[#66cc00]" /> {editingId ? "Edit Staff" : "New House Keeper"}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="flex-1 space-y-6">
                
                {/* Name Input */}
                <div>
                  <label htmlFor="keeperName" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="keeperName"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Jane Doe"
                    className={`w-full border ${errors.name ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all`}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.name}</p>
                  )}
                </div>

                {/* Phone Input */}
                <div>
                  <label htmlFor="keeperPhone" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="keeperPhone"
                    type="tel"
                    placeholder="e.g. 01712345678"
                    className={`w-full border ${errors.phone ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all`}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.phone}</p>
                  )}
                </div>

                {/* Language Input */}
                <div>
                  <label htmlFor="keeperLanguage" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="keeperLanguage"
                    type="text"
                    placeholder="e.g. English, Bengali"
                    className={`w-full border ${errors.language ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all`}
                    value={formData.language}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, language: e.target.value }));
                      if (errors.language) setErrors(prev => ({ ...prev, language: null }));
                    }}
                  />
                  {errors.language && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.language}</p>
                  )}
                </div>

              </div> {/* Make sure this encapsulates all input fields */}

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

export default HouseKeepersManager;