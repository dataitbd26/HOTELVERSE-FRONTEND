import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Helmet } from "react-helmet";
import { useRoomCategory } from "../../../Hook/useRoomCategory";
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";
import PageHeader from "../../../components/PageHeader";
import BEDDING_TYPES from "../../../assets/Json/beddingtype.json";
import falicityJson from "../../../assets/Json/room-facility.json";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaBed,
  FaChevronLeft, FaChevronRight, FaExclamationCircle, FaTags, 
  FaConciergeBell, FaChevronDown, FaMoneyBillWave, FaUsers
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const defaultFormState = { 
  categoryName: "", 
  facility: [], 
  rate: "",
  person: { adult: 1, child: 0 },
  beddingType: ""
};

const RoomCategoryManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllRoomCategories, 
    createRoomCategory, 
    updateRoomCategory, 
    removeRoomCategory, 
    loading 
  } = useRoomCategory();

  // State Management
  const [categoriesList, setCategoriesList] = useState([]);
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
  const [formData, setFormData] = useState(defaultFormState);

  // --- Facility Search & Create State ---
  const [facilitySearchText, setFacilitySearchText] = useState("");
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Flatten the categorized JSON into a single array of strings
  const allFacilitiesList = useMemo(() => {
    if (!falicityJson || !falicityJson.room_facilities) return [];
    return Object.values(falicityJson.room_facilities).flat();
  }, []);

  // Filter facilities based on search input
  const filteredFacilities = useMemo(() => {
    if (!facilitySearchText.trim()) return allFacilitiesList.filter(f => !formData.facility.includes(f));
    return allFacilitiesList.filter(f => 
      f.toLowerCase().includes(facilitySearchText.toLowerCase()) &&
      !formData.facility.includes(f) // Don't show already selected ones
    );
  }, [facilitySearchText, formData.facility, allFacilitiesList]);

  // Check if the exact typed text already exists in the JSON list or selected tags
  const isExactMatchExists = useMemo(() => {
    const text = facilitySearchText.trim().toLowerCase();
    if (!text) return true; // Don't show "Add empty"
    return allFacilitiesList.some(f => f.toLowerCase() === text) || formData.facility.some(f => f.toLowerCase() === text);
  }, [facilitySearchText, allFacilitiesList, formData.facility]);

  // Handle outside click for facility dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFacilityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addFacility = (facilityName) => {
    const trimmedName = facilityName.trim();
    if (!trimmedName) return;
    
    if (!formData.facility.includes(trimmedName)) {
      setFormData(prev => ({ ...prev, facility: [...prev.facility, trimmedName] }));
    }
    setFacilitySearchText("");
    setShowFacilityDropdown(false);
  };

  const removeFacility = (facilityToRemove) => {
    setFormData(prev => ({
      ...prev,
      facility: prev.facility.filter(f => f !== facilityToRemove)
    }));
  };
  // -------------------------------------

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
  const loadCategories = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllRoomCategories({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
        branch: userBranch 
      });
      
      if (data) {
        setCategoriesList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load room categories");
    }
  }, [getAllRoomCategories, currentPage, itemsPerPage, debouncedSearch, userBranch]);

  useEffect(() => { 
    loadCategories(); 
  }, [loadCategories]);

  // --- Handlers ---
  const handleOpenModal = useCallback((category = null) => {
    setErrors({}); 
    setFacilitySearchText("");

    if (category) {
      setEditingId(category._id);
      
      // Safety conversion: string to array
      let facilityArray = [];
      if (category.facility) {
        facilityArray = category.facility.split(", ").filter(Boolean);
      }

      setFormData({ 
        categoryName: category.categoryName, 
        facility: facilityArray,
        rate: category.rate || "",
        person: { 
          adult: category.person?.adult || 1, 
          child: category.person?.child || 0 
        },
        beddingType: category.beddingType || ""
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
      setFacilitySearchText("");
      setErrors({});
    }, 200);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.categoryName.trim()) newErrors.categoryName = "Category Name is required.";
    if (!formData.rate || Number(formData.rate) <= 0) newErrors.rate = "A valid rate is required.";
    if (!formData.beddingType) newErrors.beddingType = "Bedding Type is required.";
    if (!formData.person.adult || Number(formData.person.adult) < 1) newErrors.adult = "At least 1 adult is required.";
    
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
        categoryName: formData.categoryName.trim(), 
        facility: formData.facility.join(", "), // Convert array to string for DB
        rate: Number(formData.rate),
        person: {
          adult: Number(formData.person.adult),
          child: Number(formData.person.child)
        },
        beddingType: formData.beddingType,
        branch: userBranch 
      };
      
      if (editingId) {
        await updateRoomCategory(editingId, payload);
        toast.success("Category updated successfully");
      } else {
        await createRoomCategory(payload);
        toast.success("Category created successfully");
      }
      
      handleCloseModal();
      loadCategories();
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
        await removeRoomCategory(id);
        toast.success("Deleted successfully");
        if (categoriesList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadCategories();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeRoomCategory, loadCategories, categoriesList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Room Categories | Admin Dashboard</title>
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Room Categories" 
          subtitle="Manage room classifications, rates, and facilities" 
          icon={<FaTags className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} aria-hidden="true" /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="searchCategory" className="text-sm font-bold">Search</label>
            <input 
              id="searchCategory"
              type="search"
              className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-72 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all"
              placeholder="Filter by name, facility or bed..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <label htmlFor="rowsPerPage" className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rows:</label>
             <div className="relative">
               <select 
                 id="rowsPerPage"
                 className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded pl-2 pr-6 py-1 text-xs outline-none cursor-pointer appearance-none"
                 value={itemsPerPage}
                 onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
               >
                 {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                   <option key={opt} value={opt}>{opt}</option>
                 ))}
               </select>
               <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={8} />
             </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto p-5 min-h-[400px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-gray-700 text-[#1f2937] dark:text-gray-100 font-bold border border-slate-300 dark:border-gray-600">
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px] w-1/4">Category Info</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px] w-1/4">Pricing & Occupancy</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Facilities</th>
                <th scope="col" className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px] w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : categoriesList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center border-x border-slate-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaTags size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No room categories found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categoriesList.map((category) => (
                  <tr key={category._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="font-semibold text-base text-[#66cc00]">{category.categoryName}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <FaBed size={10}/> {category.beddingType}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 text-sm font-bold">
                          <FaMoneyBillWave className="text-emerald-500 text-xs" /> ${category.rate}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <FaUsers className="text-slate-400 text-xs" /> {category.person?.adult} Adults, {category.person?.child} Children
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-wrap items-start gap-1 text-slate-600 dark:text-slate-300">
                        {category.facility ? (
                          category.facility.split(", ").map((fac, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                              <FaConciergeBell className="text-slate-400 shrink-0" size={10} />
                              {fac}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-xs">No facilities listed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 text-right align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(category)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit Category"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(category._id)} 
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete Category"
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
              Showing <span className="text-[#66cc00]">{categoriesList.length}</span> of {totalItems} Results
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
                <FaTags className="text-[#66cc00]" /> {editingId ? "Edit Category" : "New Category"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="flex-1 space-y-6">
                
                {/* Category & Bedding */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Deluxe Suite"
                      className={`w-full border ${errors.categoryName ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                      value={formData.categoryName}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, categoryName: e.target.value }));
                        if (errors.categoryName) setErrors(prev => ({ ...prev, categoryName: null }));
                      }}
                    />
                    {errors.categoryName && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.categoryName}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Bedding Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        className={`w-full border ${errors.beddingType ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 pr-8 text-sm outline-none transition-all cursor-pointer appearance-none`}
                        value={formData.beddingType}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, beddingType: e.target.value }));
                          if (errors.beddingType) setErrors(prev => ({ ...prev, beddingType: null }));
                        }}
                      >
                        <option value="" disabled>Select Bedding</option>
                        {BEDDING_TYPES.map((bed) => (
                          <option key={bed.name} value={bed.name}>
                            {bed.name}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
                    </div>
                    {errors.beddingType && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.beddingType}</p>}
                  </div>
                </div>

                {/* Rate & Occupancy */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Rate / Night <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number"
                      min="0"
                      placeholder="e.g. 1500"
                      className={`w-full border ${errors.rate ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                      value={formData.rate}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, rate: e.target.value }));
                        if (errors.rate) setErrors(prev => ({ ...prev, rate: null }));
                      }}
                    />
                    {errors.rate && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.rate}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Adults <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number"
                      min="1"
                      className={`w-full border ${errors.adult ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                      value={formData.person.adult}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, person: { ...prev.person, adult: e.target.value } }));
                        if (errors.adult) setErrors(prev => ({ ...prev, adult: null }));
                      }}
                    />
                    {errors.adult && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.adult}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                      Children
                    </label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#66cc00] transition-all"
                      value={formData.person.child}
                      onChange={(e) => setFormData(prev => ({ ...prev, person: { ...prev.person, child: e.target.value } }))}
                    />
                  </div>
                </div>

                {/* --- Facility Dynamic Search Input --- */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                    Facilities (Optional)
                  </label>
                  
                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.facility.map((fac, idx) => (
                      <div key={idx} className="bg-[#66cc00]/10 text-[#66cc00] border border-[#66cc00]/30 px-2 py-1 rounded text-xs flex items-center gap-2">
                        {fac}
                        <button 
                          type="button" 
                          onClick={() => removeFacility(fac)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Search Input with KeyDown handler */}
                  <input 
                    type="text"
                    placeholder="Search or type custom facility, press Enter to add..."
                    className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#66cc00] transition-all"
                    value={facilitySearchText}
                    onChange={(e) => {
                      setFacilitySearchText(e.target.value);
                      setShowFacilityDropdown(true);
                    }}
                    onFocus={() => setShowFacilityDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Stop form submission
                        if (facilitySearchText.trim()) {
                          addFacility(facilitySearchText);
                        }
                      }
                    }}
                  />

                  {/* Dropdown Results */}
                  {showFacilityDropdown && (facilitySearchText || filteredFacilities.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded shadow-xl max-h-48 overflow-y-auto">
                      
                      {/* Option to ADD custom text if it's not a perfect match to existing list */}
                      {!isExactMatchExists && (
                        <div 
                          onClick={() => addFacility(facilitySearchText)}
                          className="px-3 py-2 text-sm text-[#66cc00] font-bold hover:bg-slate-100 dark:hover:bg-gray-700 cursor-pointer border-b border-slate-100 dark:border-gray-700 flex items-center gap-2"
                        >
                          <FaPlus size={10} /> Add "{facilitySearchText.trim()}"
                        </div>
                      )}

                      {filteredFacilities.map((fac, idx) => (
                        <div 
                          key={idx}
                          onClick={() => addFacility(fac)}
                          className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-gray-700 cursor-pointer border-b border-slate-100 dark:border-gray-700 last:border-0"
                        >
                          {fac}
                        </div>
                      ))}

                      {filteredFacilities.length === 0 && isExactMatchExists && facilitySearchText && (
                        <div className="p-3 text-sm text-slate-400 italic text-center">
                          Facility already added.
                        </div>
                      )}
                    </div>
                  )}
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
                  {isSubmitting ? "Processing..." : editingId ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCategoryManager;