import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useUnit } from "../../../Hook/useUnit"; 
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";
import PageHeader from "../../../components/PageHeader";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaLayerGroup, FaTags,
  FaCheck, FaBan
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const UnitManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  // 🔴 DIAGNOSTIC LOG 1: Check if the user object has the branch
  useEffect(() => {
    console.log("🕵️ User Object from Auth:", user);
    console.log("🕵️ Extracted Branch:", userBranch);
    if (!userBranch) {
      console.warn("⚠️ WARNING: userBranch is missing! Data will NOT fetch and saves will be blocked.");
    }
  }, [user, userBranch]);

  const { 
    getAllUnits, 
    createUnit, 
    updateUnit, 
    removeUnit, 
    loading 
  } = useUnit();

  const [unitsList, setUnitsList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch !== searchInput) {
        setDebouncedSearch(searchInput);
        setCurrentPage(1); 
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, debouncedSearch]);

  const loadUnits = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllUnits({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
        branch: userBranch 
      });
      
      if (data) {
        setUnitsList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load units");
    }
  }, [getAllUnits, currentPage, itemsPerPage, debouncedSearch, userBranch]);

  useEffect(() => { 
    loadUnits(); 
  }, [loadUnits]);

  const handleOpenForm = useCallback((unit = null) => {
    setErrors({}); 
    if (unit) {
      setEditingId(unit._id);
      setFormData({ name: unit.name });
    } else {
      setEditingId(null);
      setFormData({ name: "" });
    }
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: "" });
    setErrors({});
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Unit Name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!userBranch) return toast.error("User branch not found. Please log in again.");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { 
        name: formData.name.trim(), 
        branch: userBranch 
      };
      
      if (editingId) {
        await updateUnit(editingId, payload);
        toast.success("Unit updated successfully");
      } else {
        await createUnit(payload);
        toast.success("Unit created successfully");
      }
      
      handleCloseForm();
      loadUnits();
    } catch (err) {
      // 🔴 DIAGNOSTIC LOG 2: Catching backend rejection
      console.error("Save Error Details:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message || "Execution failed. Please try again.");
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
        await removeUnit(id);
        toast.success("Deleted successfully");
        if (unitsList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadUnits();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeUnit, loadUnits, unitsList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Units Management | Admin Dashboard</title>
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Measurement Units" 
          subtitle="Manage operational units" 
          icon={<FaLayerGroup className="text-[#66cc00]" />} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Top Controls: Add Button & Search */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-gray-800/50">
          <button 
            onClick={() => handleOpenForm()}
            disabled={isFormOpen && !editingId}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 px-4 py-1.5 rounded text-sm font-medium shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-max"
          >
            <FaPlus size={12} /> Add New Record
          </button>

          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="searchUnit" className="text-sm font-bold hidden sm:block">Search:</label>
              <input 
                id="searchUnit"
                type="search"
                className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-64 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all"
                placeholder="Filter by unit name..."
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
        </div>

        {/* Table Area with Inline Form */}
        <div className="overflow-x-auto p-5 min-h-[400px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#66cc00] text-white font-medium border border-[#66cc00]">
                <th scope="col" className="px-4 py-2.5 text-left text-sm" colSpan="2">
                  Unit Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700 border-x border-b border-slate-200 dark:border-gray-700">
              
              {/* 🟢 INLINE EDIT/ADD FORM ROW */}
              {isFormOpen && (
                <tr className="bg-slate-50 dark:bg-gray-700/30">
                  <td className="px-4 py-3 align-middle">
                    <input
                      type="text"
                      placeholder="Enter unit name (e.g., Kg, Litre, Box)..."
                      className={`w-full max-w-lg border ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-800 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#66cc00] transition-all`}
                      value={formData.name}
                      autoFocus
                      onChange={(e) => {
                        setFormData({ name: e.target.value });
                        if (errors.name) setErrors({});
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 absolute">{errors.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-right align-middle w-56">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-3 py-1 border border-slate-300 dark:border-gray-600 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        <FaCheck size={12} className="text-slate-500 dark:text-slate-400" /> 
                        {editingId ? "Update" : "Save"}
                      </button>
                      <button
                        onClick={handleCloseForm}
                        className="flex items-center gap-1.5 px-3 py-1 border border-slate-300 dark:border-gray-600 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded text-sm transition-colors"
                      >
                        <FaBan size={12} className="text-slate-500 dark:text-slate-400" /> 
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {loading ? (
                <tr><td colSpan="2" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : unitsList.length === 0 && !isFormOpen ? (
                <tr>
                  <td colSpan="2" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaTags size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No units found</p>
                      <p className="text-sm mt-1">Click 'Add New Record' to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                unitsList.map((unit) => (
                  <tr key={unit._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-3 align-middle text-slate-700 dark:text-gray-200">
                      {unit.name}
                    </td>
                    <td className="px-4 py-3 text-right align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenForm(unit)} 
                          className="flex items-center gap-1.5 px-3 py-1 border border-slate-300 dark:border-gray-600 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded text-sm transition-colors"
                        >
                          <FaEdit size={12} className="text-slate-500 dark:text-slate-400" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(unit._id)} 
                          className="flex items-center gap-1.5 px-3 py-1 border border-slate-300 dark:border-gray-600 bg-slate-100 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/40 text-slate-700 hover:text-red-600 dark:text-gray-200 rounded text-sm transition-colors"
                        >
                          <FaTimes size={12} className="text-slate-500 dark:text-slate-400" /> Delete
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
              Showing <span className="text-[#66cc00]">{unitsList.length}</span> of {totalItems} Results
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
    </div>
  );
};

export default UnitManager;