import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useLostAndFound } from "../../Hook/useLostAndFound";
import SkeletonLoader from "../../components/SkeletonLoader";
import useAuth from "../../Hook/useAuth";
import { getPaginationRange } from "../../utilities/paginationUtils";
import PageHeader from "../../components/PageHeader"

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaExclamationCircle, FaBoxOpen, FaCheckCircle, FaSearch
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

// Helper to format Date for input fields (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split('T')[0];
};

const defaultFormState = {
  itemDetail: { room: "", reservation: "", item: "", description: "", foundedBy: "", foundedOn: "" },
  claimDetail: { claimedBy: "", phone: "", claimedOn: "" },
  returnDetail: { returnTo: "", returnedOn: "", verified: false, remark: "" }
};



const LostAndFoundManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllLostAndFounds, 
    createLostAndFound, 
    updateLostAndFound, 
    removeLostAndFound, 
    loading 
  } = useLostAndFound();

  // State Management
  const [itemsList, setItemsList] = useState([]);
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
  const loadData = useCallback(async () => {
    if (!userBranch) return; 
    try {
      const response = await getAllLostAndFounds({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
        branch: userBranch 
      });
      
      if (response) {
        setItemsList(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load records");
    }
  }, [getAllLostAndFounds, currentPage, itemsPerPage, debouncedSearch, userBranch]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // --- Handlers ---
  const handleOpenModal = useCallback((item = null) => {
    setErrors({}); 
    if (item) {
      setEditingId(item._id);
      setFormData({ 
        itemDetail: {
          room: item.itemDetail?.room || "",
          reservation: item.itemDetail?.reservation || "",
          item: item.itemDetail?.item || "",
          description: item.itemDetail?.description || "",
          foundedBy: item.itemDetail?.foundedBy || "",
          foundedOn: formatDateForInput(item.itemDetail?.foundedOn)
        },
        claimDetail: {
          claimedBy: item.claimDetail?.claimedBy || "",
          phone: item.claimDetail?.phone || "",
          claimedOn: formatDateForInput(item.claimDetail?.claimedOn)
        },
        returnDetail: {
          returnTo: item.returnDetail?.returnTo || "",
          returnedOn: formatDateForInput(item.returnDetail?.returnedOn),
          verified: item.returnDetail?.verified || false,
          remark: item.returnDetail?.remark || ""
        }
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

  // --- STRICT CLIENT SIDE VALIDATION ---
  const validateForm = () => {
    const newErrors = {};
    
    // 1. Check Required Fields
    if (!formData.itemDetail.item.trim()) newErrors.item = "Item Name is required.";
    if (!formData.itemDetail.room.trim()) newErrors.room = "Room No. is required.";
    if (!formData.itemDetail.foundedBy.trim()) newErrors.foundedBy = "Found By is required.";
    if (!formData.itemDetail.foundedOn) newErrors.foundedOn = "Found On date is required.";
    
    // 2. Optional Phone Number Validation (BD Format)
    const phoneInput = formData.claimDetail.phone.trim();
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (phoneInput && !bdPhoneRegex.test(phoneInput)) {
      newErrors.phone = "Must be a valid BD number (e.g. 017XXXXXXXX).";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // --------------------------------------

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userBranch) return toast.error("User branch not found. Please log in again.");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 1. Make a deep copy of the form data so we don't mutate React state
      const payload = JSON.parse(JSON.stringify(formData));
      
      // 2. Add the branch
      payload.branch = userBranch;

      // 3. CRITICAL FIX: Mongoose crashes if it receives "" for a Date field. 
      // We must change empty strings to null for optional dates.
      if (!payload.claimDetail.claimedOn) {
        payload.claimDetail.claimedOn = null;
      }
      if (!payload.returnDetail.returnedOn) {
        payload.returnDetail.returnedOn = null;
      }
      
      if (editingId) {
        await updateLostAndFound(editingId, payload);
        toast.success("Record updated successfully");
      } else {
        await createLostAndFound(payload);
        toast.success("Record created successfully");
      }
      
      handleCloseModal();
      loadData();
    } catch (err) {
      // This will now successfully catch and display any specific backend errors!
      console.error("Backend Error:", err);
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
        await removeLostAndFound(id);
        toast.success("Deleted successfully");
        if (itemsList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadData();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeLostAndFound, loadData, itemsList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Lost & Found Management | Admin</title>
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Lost & Found" 
          subtitle="Manage lost items, claims, and returns" 
          icon={<FaBoxOpen className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} aria-hidden="true" /> Add Record
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="searchRecord" className="text-sm font-bold">Search</label>
            <input 
              id="searchRecord"
              type="search"
              className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-72 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all"
              placeholder="Search items, rooms..."
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
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Item Info</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Found Details</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Status</th>
                <th scope="col" className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : itemsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center border-x border-slate-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaSearch size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                itemsList.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="font-semibold text-[#66cc00]">{record.itemDetail?.item}</div>
                      <div className="text-xs text-slate-500 mt-1">Room: {record.itemDetail?.room}</div>
                      <div className="text-xs text-slate-500 line-clamp-1" title={record.itemDetail?.description}>{record.itemDetail?.description}</div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="text-sm">{record.itemDetail?.foundedBy}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {record.itemDetail?.foundedOn ? new Date(record.itemDetail.foundedOn).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      {record.returnDetail?.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                           <FaCheckCircle /> Returned
                        </span>
                      ) : record.claimDetail?.claimedBy ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 text-right align-top">
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button 
                          onClick={() => handleOpenModal(record)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit Record"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(record._id)} 
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete Record"
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
              Showing <span className="text-[#66cc00]">{itemsList.length}</span> of {totalItems} Results
            </div>
            <div className="flex items-center gap-1 join" aria-label="Pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-l border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors"
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
                      currentPage === pageNum ? "bg-[#66cc00] text-white border-[#66cc00]" : "bg-white dark:bg-gray-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded-r border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors"
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
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-gray-700 pb-4 shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaBoxOpen className="text-[#66cc00]" /> {editingId ? "Edit Record" : "New Record"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="flex-1 space-y-8">
                
                {/* --- ITEM DETAILS --- */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-gray-700 pb-2">Item Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Item Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="e.g. Wallet"
                        className={`w-full border ${errors.item ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                        value={formData.itemDetail.item}
                        onChange={(e) => handleNestedChange('itemDetail', 'item', e.target.value)}
                      />
                      {errors.item && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.item}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Room No. <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="e.g. 101"
                        className={`w-full border ${errors.room ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                        value={formData.itemDetail.room}
                        onChange={(e) => handleNestedChange('itemDetail', 'room', e.target.value)}
                      />
                      {errors.room && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.room}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Reservation No.</label>
                    <input 
                      type="text"
                      placeholder="e.g. RES-00123"
                      className="w-full border border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all"
                      value={formData.itemDetail.reservation}
                      onChange={(e) => handleNestedChange('itemDetail', 'reservation', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Description</label>
                    <textarea 
                      rows="2"
                      placeholder="e.g. Black leather wallet with ID"
                      className="w-full border border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all resize-none"
                      value={formData.itemDetail.description}
                      onChange={(e) => handleNestedChange('itemDetail', 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Found By <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="e.g. Jane Doe"
                        className={`w-full border ${errors.foundedBy ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                        value={formData.itemDetail.foundedBy}
                        onChange={(e) => handleNestedChange('itemDetail', 'foundedBy', e.target.value)}
                      />
                      {errors.foundedBy && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.foundedBy}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Found On <span className="text-red-500">*</span></label>
                      <input 
                        type="date"
                        className={`w-full border ${errors.foundedOn ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                        value={formData.itemDetail.foundedOn}
                        onChange={(e) => handleNestedChange('itemDetail', 'foundedOn', e.target.value)}
                      />
                      {errors.foundedOn && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.foundedOn}</p>}
                    </div>
                  </div>
                </div>

                {/* --- CLAIM DETAILS --- */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-gray-700 pb-2">Claim Details</h4>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Claimed By</label>
                    <input 
                      type="text"
                      placeholder="e.g. John Smith"
                      className="w-full border border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all"
                      value={formData.claimDetail.claimedBy}
                      onChange={(e) => handleNestedChange('claimDetail', 'claimedBy', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Phone</label>
                      <input 
                        type="text"
                        placeholder="e.g. 01700000000"
                        className={`w-full border ${errors.phone ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00]'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all`}
                        value={formData.claimDetail.phone}
                        onChange={(e) => handleNestedChange('claimDetail', 'phone', e.target.value)}
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium"><FaExclamationCircle /> {errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Claimed On</label>
                      <input 
                        type="date"
                        className="w-full border border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all"
                        value={formData.claimDetail.claimedOn}
                        onChange={(e) => handleNestedChange('claimDetail', 'claimedOn', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* --- RETURN DETAILS --- */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-gray-700 pb-2">Return Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Return To</label>
                      <input 
                        type="text"
                        placeholder="e.g. John Smith"
                        className="w-full border border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all"
                        value={formData.returnDetail.returnTo}
                        onChange={(e) => handleNestedChange('returnDetail', 'returnTo', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Returned On</label>
                      <input 
                        type="date"
                        className="w-full border border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all"
                        value={formData.returnDetail.returnedOn}
                        onChange={(e) => handleNestedChange('returnDetail', 'returnedOn', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Remark</label>
                    <input 
                      type="text"
                      placeholder="e.g. Sent via courier"
                      className="w-full border border-slate-300 dark:border-gray-600 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm outline-none transition-all"
                      value={formData.returnDetail.remark}
                      onChange={(e) => handleNestedChange('returnDetail', 'remark', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      id="verifiedCheck"
                      type="checkbox"
                      className="w-4 h-4 accent-[#66cc00] cursor-pointer"
                      checked={formData.returnDetail.verified}
                      onChange={(e) => handleNestedChange('returnDetail', 'verified', e.target.checked)}
                    />
                    <label htmlFor="verifiedCheck" className="text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer uppercase tracking-wider">
                      Item Return Verified
                    </label>
                  </div>
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
                  {isSubmitting ? "Processing..." : editingId ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostAndFoundManager;