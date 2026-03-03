import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useOrganization } from "../../../Hook/useOrganization"; 
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";
import PageHeader from "../../../components/PageHeader";

// JSON Data Imports
import Disctric from "../../../assets/Json/District.json";
import CountrAndCode from "../../../assets/Json/Country.json";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaExclamationCircle, FaBuilding,
  FaPhone, FaEnvelope, FaPercentage, FaIdCard
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const defaultFormState = {
  name: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  district: "",
  state: "",
  postCode: "",
  country: "Bangladesh", // Default BD Country
  phone: "",
  companyLicenseNumber: "", 
  ratePlan: "",
  discount: 0,
  addAsLedger: false,
  notes: ""
};

const OrganizationManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllOrganizations, 
    createOrganization, 
    updateOrganization, 
    removeOrganization, 
    loading 
  } = useOrganization();

  // State Management
  const [orgList, setOrgList] = useState([]);
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
  const loadOrganizations = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllOrganizations({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
        branch: userBranch 
      });
      
      if (data) {
        setOrgList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load organizations");
    }
  }, [getAllOrganizations, currentPage, itemsPerPage, debouncedSearch, userBranch]);

  useEffect(() => { 
    loadOrganizations(); 
  }, [loadOrganizations]);

  // --- Handlers ---
  const handleOpenModal = useCallback((org = null) => {
    setErrors({}); 
    if (org) {
      setEditingId(org._id);
      setFormData({
        name: org.name || "",
        email: org.email || "",
        address1: org.address?.address1 || "",
        address2: org.address?.address2 || "",
        city: org.address?.city || "",
        district: org.address?.district || "",
        state: org.address?.state || "",
        postCode: org.address?.postCode || "",
        country: org.address?.country || "Bangladesh",
        phone: org.phone || "",
        companyLicenseNumber: org.companyLicenseNumber || "",
        ratePlan: org.ratePlan || "",
        discount: org.discount || 0,
        addAsLedger: org.addAsLedger || false,
        notes: org.notes || ""
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Reset district if country changes away from Bangladesh
    if (name === "country" && value !== "Bangladesh") {
      setFormData(prev => ({ ...prev, district: "" }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (!formData.postCode.trim()) newErrors.postCode = "Post Code is required.";
    if (!formData.ratePlan.trim()) newErrors.ratePlan = "Rate Plan is required.";
    
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
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyLicenseNumber: formData.companyLicenseNumber.trim(),
        ratePlan: formData.ratePlan.trim(),
        discount: Number(formData.discount),
        addAsLedger: formData.addAsLedger,
        notes: formData.notes.trim(),
        branch: userBranch,
        address: {
          address1: formData.address1.trim(),
          address2: formData.address2.trim(),
          city: formData.city.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
          postCode: formData.postCode.trim(),
          country: formData.country.trim()
        }
      };
      
      if (editingId) {
        await updateOrganization(editingId, payload);
        toast.success("Organization updated successfully");
      } else {
        await createOrganization(payload);
        toast.success("Organization created successfully");
      }
      
      handleCloseModal();
      loadOrganizations();
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
      text: "This action cannot be undone. It will remove the organization record.",
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
        await removeOrganization(id);
        toast.success("Deleted successfully");
        if (orgList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadOrganizations();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeOrganization, loadOrganizations, orgList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Organization Profiles | Admin Dashboard</title>
        <meta name="description" content="Manage organization profiles and details." />
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Organization Profiles" 
          subtitle="Manage organization profiles and details" 
          icon={<FaBuilding className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} aria-hidden="true" /> Add Organization
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            
            {/* Search Box */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label htmlFor="searchOrg" className="text-sm font-bold hidden sm:block">Search</label>
              <input 
                id="searchOrg"
                type="search"
                className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-64 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all"
                placeholder="Search name, email, phone..."
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
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Organization Info</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Contact Info</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Financial & Ledger</th>
                <th scope="col" className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px] w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : orgList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center border-x border-slate-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaBuilding size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No organizations found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orgList.map((org) => (
                  <tr key={org._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-[#66cc00]">
                          {org.name}
                        </span>
                        {org.companyLicenseNumber && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <FaIdCard className="inline text-slate-400" /> License: {org.companyLicenseNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-2 text-sm">
                          <FaPhone className="text-slate-400 text-xs" /> {org.phone}
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <FaEnvelope className="text-slate-400 text-xs" /> {org.email}
                        </span>
                        {org.address?.city && (
                           <span className="text-xs text-slate-500 mt-1">
                             {org.address.city}, {org.address.country}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <FaPercentage className="text-slate-400 text-xs" /> Discount: {org.discount}%
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                           Rate Plan: <span className="font-semibold text-[#5c6bc0] dark:text-indigo-400">{org.ratePlan}</span>
                        </span>
                        {org.addAsLedger && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#66cc00] bg-[#66cc00]/10 dark:bg-[#66cc00]/20 px-2 py-0.5 rounded w-max mt-1 border border-[#66cc00]/30">
                            LEDGER ACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 text-right align-top">
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button 
                          onClick={() => handleOpenModal(org)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(org._id)} 
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
              Showing <span className="text-[#66cc00]">{orgList.length}</span> of {totalItems} Results
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
          <div className="w-full max-w-4xl bg-white dark:bg-gray-800 h-full shadow-2xl animate-slide-in-right p-6 md:p-8 overflow-y-auto flex flex-col relative">
            
            <div className="flex justify-between items-center mb-6 pb-4 shrink-0 border-b border-slate-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FaBuilding className="text-[#66cc00]" /> {editingId ? "Edit Organization" : "Create Organization"}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 space-y-6 pb-10">
                
                {/* Horizontal Form Layout matching Screenshot Style */}
                
                {/* Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Name <span className="text-red-500">*</span></label>
                  <div className="flex-1">
                    <input 
                      type="text"
                      name="name"
                      className={`w-full border ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]`}
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle/> {errors.name}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Email <span className="text-red-500">*</span></label>
                  <div className="flex-1">
                    <input 
                      type="email"
                      name="email"
                      className={`w-full border ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]`}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle/> {errors.email}</p>}
                  </div>
                </div>

                {/* Address 1 & 2 */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0 sm:pt-2">Address</label>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text"
                      name="address1"
                      placeholder="Address 1"
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
                      value={formData.address1}
                      onChange={handleInputChange}
                    />
                    <input 
                      type="text"
                      name="address2"
                      placeholder="Address 2"
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
                      value={formData.address2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">City <span className="text-red-500">*</span></label>
                  <div className="flex-1">
                    <input 
                      type="text"
                      name="city"
                      className={`w-full border ${errors.city ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]`}
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle/> {errors.city}</p>}
                  </div>
                </div>

                {/* State */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">State <span className="text-red-500">*</span></label>
                  <div className="flex-1">
                    <input 
                      type="text"
                      name="state"
                      className={`w-full border ${errors.state ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]`}
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle/> {errors.state}</p>}
                  </div>
                </div>

                {/* Country */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Country</label>
                  <div className="flex-1">
                    <select 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
                    >
                      <option value="">Select Country</option>
                      {CountrAndCode.map((item, index) => (
                        <option key={`country-${index}`} value={item.Name}>
                          {item.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* District (Conditional based on Bangladesh) */}
                {formData.country === "Bangladesh" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">District</label>
                    <div className="flex-1">
                      <select 
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
                      >
                        <option value="">Select District</option>
                        {Disctric.map((item, index) => (
                          <option key={`dist-${index}`} value={item.district}>
                            {item.district}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Post Code */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Post Code <span className="text-red-500">*</span></label>
                  <div className="flex-1">
                    <input 
                      type="text"
                      name="postCode"
                      className={`w-full border ${errors.postCode ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]`}
                      value={formData.postCode}
                      onChange={handleInputChange}
                    />
                    {errors.postCode && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle/> {errors.postCode}</p>}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex-1">
                    <input 
                      type="text"
                      name="phone"
                      className={`w-full border ${errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]`}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle/> {errors.phone}</p>}
                  </div>
                </div>

                {/* Company License Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-white bg-[#5c6bc0] sm:w-40 sm:text-right shrink-0 px-2 py-1 rounded-sm self-start sm:self-center text-center">Company License</label>
                  <div className="flex-1">
                    <input 
                      type="text"
                      name="companyLicenseNumber"
                      className="w-full border border-[#5c6bc0] bg-[#f8fbff] dark:bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5c6bc0]"
                      value={formData.companyLicenseNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Rate Plan */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Rate Plan <span className="text-red-500">*</span></label>
                  <div className="flex-1">
                    <select 
                      name="ratePlan"
                      className={`w-full border ${errors.ratePlan ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]`}
                      value={formData.ratePlan}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="Standard">Standard</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Premium">Premium</option>
                    </select>
                    {errors.ratePlan && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaExclamationCircle/> {errors.ratePlan}</p>}
                  </div>
                </div>

                {/* Discount */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Discount</label>
                  <div className="flex-1 flex">
                    <input 
                      type="number"
                      name="discount"
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] border-r-0"
                      value={formData.discount}
                      onChange={handleInputChange}
                    />
                    <span className="bg-slate-100 dark:bg-gray-600 border border-slate-300 dark:border-gray-600 rounded-r px-3 py-2 text-sm text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">%</span>
                  </div>
                </div>

                {/* Add As A Ledger */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0">Add As A Ledger</label>
                  <div className="flex-1 flex items-center h-8">
                    <input 
                      type="checkbox"
                      name="addAsLedger"
                      checked={formData.addAsLedger}
                      onChange={handleInputChange}
                      className="w-4 h-4 cursor-pointer accent-[#66cc00]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sm:w-40 sm:text-right shrink-0 pt-2">Notes</label>
                  <div className="flex-1">
                    <textarea 
                      name="notes"
                      rows="3"
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] resize-none"
                      value={formData.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3 mt-auto sticky bottom-0">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-slate-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium text-sm hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#66cc00] hover:bg-[#336600] text-white px-8 py-2 rounded font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                >
                  {isSubmitting ? "Processing..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManager;